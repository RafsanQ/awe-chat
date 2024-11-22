package internal

import (
	"errors"
	"net/http"
	db "server/db/sqlc"
	"server/util"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/sync/errgroup"
)

type createUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (server *Server) createUser(ctx *gin.Context) {
	var req createUserRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.CreateUserParams{
		Email:    req.Email,
		Username: req.Username,
		Password: hashedPassword,
	}

	user, err := server.database.Queries.CreateUser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, user)
}

type loginUserRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginUserResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Token    string `json:"token"`
}

type CustomJWTClaims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (server *Server) login(ctx *gin.Context) {
	var req loginUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	user, err := server.database.Queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	err = util.CheckPassword(user.Password, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("Invalid password")))
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomJWTClaims{
		Email:    user.Email,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    user.Email,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	signedString, err := token.SignedString([]byte(server.config.SecretKey))

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.SetCookie("jwt", signedString, 3600, "/", "localhost", true, true)

	ctx.JSON(http.StatusOK, &loginUserResponse{
		Username: user.Username,
		Email:    user.Email,
		Token:    signedString,
	})
}

func (server *Server) logout(ctx *gin.Context) {
	ctx.SetCookie("jwt", "", -1, "", "", false, true)
	ctx.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

type friendConnectionRequest struct {
	FriendEmail string `json:"friend_email" binding:"required,email"`
	UserEmail   string `json:"user_email" binding:"required,email"`
}

func (server *Server) requestFriendConnection(ctx *gin.Context) {
	var req friendConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.FriendEmail == req.UserEmail {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("Cannot request friend connection with yourself")))
		return
	}

	g, _ := errgroup.WithContext(ctx)

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.FriendEmail)
		return err
	})

	g.Go(func() (err error) {
		res, _ := server.database.Queries.GetFriendConnections(ctx, db.GetFriendConnectionsParams{
			UserEmailFrom: req.UserEmail,
			UserEmailTo:   req.FriendEmail,
		})
		if len(res) > 0 {
			return errors.New("Friend connection already exists")
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	// Transaction
	tx, err := server.database.GetConnection().Begin(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer tx.Rollback(ctx)

	qtx := server.database.Queries.WithTx(tx)
	err = qtx.RequestFriendConnection(ctx, db.RequestFriendConnectionParams{
		UserEmailFrom: req.FriendEmail,
		UserEmailTo:   req.UserEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = qtx.RequestFriendConnection(ctx, db.RequestFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tx.Commit(ctx)
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Friend Request Sent",
	})
}

func (server *Server) acceptFriendConnection(ctx *gin.Context) {
	var req friendConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.FriendEmail == req.UserEmail {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("Cannot request friend connection with yourself")))
		return
	}

	g, _ := errgroup.WithContext(ctx)

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.FriendEmail)
		return err
	})

	g.Go(func() (err error) {
		res, _ := server.database.Queries.GetFriendConnections(ctx, db.GetFriendConnectionsParams{
			UserEmailFrom: req.UserEmail,
			UserEmailTo:   req.FriendEmail,
		})
		if len(res) == 0 {
			return errors.New("Friend connection has not been requested")
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	// Transaction
	tx, err := server.database.GetConnection().Begin(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer tx.Rollback(ctx)

	qtx := server.database.Queries.WithTx(tx)
	err = qtx.ConfirmFriendConnection(ctx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.FriendEmail,
		UserEmailTo:   req.UserEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = qtx.ConfirmFriendConnection(ctx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tx.Commit(ctx)
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Friend Request Sent",
	})
}

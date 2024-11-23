package internal

import (
	"errors"
	"fmt"
	"net/http"
	db "server/db/sqlc"
	"server/util"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
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

	user, err := server.databaseQueries.CreateUser(ctx, server.databaseConnection, arg)
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

	user, err := server.databaseQueries.GetUserByEmail(ctx, server.databaseConnection, req.Email)
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
		_, err = server.databaseQueries.GetUserByEmail(ctx, server.databaseConnection, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.databaseQueries.GetUserByEmail(ctx, server.databaseConnection, req.FriendEmail)
		return err
	})

	g.Go(func() (err error) {
		res, _ := server.databaseQueries.GetFriendConnections(ctx, server.databaseConnection, db.GetFriendConnectionsParams{
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
	tx, err := server.databaseConnection.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	g, _ = errgroup.WithContext(ctx)

	g.Go(func() (err error) {

		// err = server.databaseQueries.RequestFriendConnection(ctx, tx, db.RequestFriendConnectionParams{
		// 	UserEmailFrom: req.FriendEmail,
		// 	UserEmailTo:   req.UserEmail,
		// })
		_, err = server.databaseQueries.GetUserByEmail(ctx, tx, req.UserEmail)
		if err != nil {
			fmt.Println("at 1", err.Error())
		}
		return err
	})

	g.Go(func() (err error) {

		// err = server.databaseQueries.RequestFriendConnection(ctx, tx, db.RequestFriendConnectionParams{
		// 	UserEmailFrom: req.UserEmail,
		// 	UserEmailTo:   req.FriendEmail,
		// })
		_, err = server.databaseQueries.GetUserByEmail(ctx, tx, req.FriendEmail)
		if err != nil {
			fmt.Println("at 2", err.Error())
		}
		return err
	})

	if err := g.Wait(); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = tx.Commit(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
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
		_, err = server.databaseQueries.GetUserByEmail(ctx, server.databaseConnection, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.databaseQueries.GetUserByEmail(ctx, server.databaseConnection, req.FriendEmail)
		return err
	})

	g.Go(func() (err error) {
		res, _ := server.databaseQueries.GetFriendConnections(ctx, server.databaseConnection, db.GetFriendConnectionsParams{
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
	tx, err := server.databaseConnection.Begin(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer tx.Rollback(ctx)

	err = server.databaseQueries.ConfirmFriendConnection(ctx, tx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.FriendEmail,
		UserEmailTo:   req.UserEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = server.databaseQueries.ConfirmFriendConnection(ctx, tx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tx.Commit(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Friend Request Sent",
	})
}

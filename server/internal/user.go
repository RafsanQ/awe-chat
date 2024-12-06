package internal

import (
	"errors"
	"net/http"
	db "server/database/sqlc"
	"server/util"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

	if _, err := server.database.Queries.GetUserByEmail(ctx, arg.Email); err == nil {
		ctx.JSON(http.StatusConflict, errorResponse(errors.New("email already exists")))
		return
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

type searchUsersRequest struct {
	UserEmail    string `form:"user_email" binding:"required,email"`
	SearchString string `form:"search_string" binding:"required"`
}

type searchUsersResponse struct {
	db.SearchUsersRow
	IsFriend bool `json:"is_friend"`
}

func deleteEmptyUserResponse(res []searchUsersResponse) []searchUsersResponse {
	var r []searchUsersResponse
	for _, userTuple := range res {
		if userTuple.SearchUsersRow.Email != "" {
			r = append(r, userTuple)
		}
	}
	return r
}

func (server *Server) searchUsers(ctx *gin.Context) {
	var req searchUsersRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	_, err := server.database.Queries.GetUserByEmail(ctx, req.UserEmail)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	users, err := server.database.Queries.SearchUsers(ctx, db.SearchUsersParams{
		Email:        req.UserEmail,
		SearchString: "%%" + req.SearchString + "%%",
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(users) == 0 {
		ctx.JSON(http.StatusOK, gin.H{
			"users": []int{},
		})
		return
	}

	ch := make(chan searchUsersResponse)

	for i, user := range users {
		go func(i int, user db.SearchUsersRow) {
			friendConnection, err := server.database.Queries.GetFriendConnections(ctx, db.GetFriendConnectionsParams{
				UserEmailFrom: req.UserEmail,
				UserEmailTo:   user.Email,
			})

			if err != nil {
				ch <- searchUsersResponse{}
				return
			}
			var isFriend bool
			if len(friendConnection) > 0 {
				isFriend = true
			} else {
				isFriend = false
			}

			ch <- searchUsersResponse{
				IsFriend:       isFriend,
				SearchUsersRow: user,
			}
		}(i, user)
	}

	res := make([]searchUsersResponse, len(users))

	for i := range res {
		res[i] = <-ch
	}

	// The ones with an error had returned an empty response. Filter them out.
	res = deleteEmptyUserResponse(res)

	// Sort the ones that are not friends yet up top.
	sort.Slice(res, func(i, j int) bool {
		return res[j].IsFriend
	})

	ctx.JSON(http.StatusOK, gin.H{
		"users": res,
	})
}

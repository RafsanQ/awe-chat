package internal

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	authHeaderKey = "authorization"
)

func authMiddleWare() gin.HandlerFunc {

	return func(ctx *gin.Context) {
		authorizationHeader := ctx.GetHeader(authHeaderKey)
		if len(authorizationHeader) == 0 {
			err := errors.New("Authorization header not provided")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}
		ctx.Next()
	}
}

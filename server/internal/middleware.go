package internal

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func ginBodyLogMiddleware(c *gin.Context) {
	blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
	c.Writer = blw
	c.Next()
	statusCode := c.Writer.Status()
	if statusCode >= 400 {
		//ok this is an request with error, let's make a record for it
		// now print body (or log in your preferred way)
		fmt.Println("Response body: " + blw.body.String())
	}
}

const (
	authHeaderKey = "authorization"
)

func authMiddleWare(secretString string) gin.HandlerFunc {

	return func(ctx *gin.Context) {
		authorizationHeader := ctx.GetHeader(authHeaderKey)
		if len(authorizationHeader) == 0 {
			err := errors.New("Authorization header not provided")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}
		token, err := jwt.ParseWithClaims(authorizationHeader, &CustomJWTClaims{}, func(t *jwt.Token) (interface{}, error) {
			return []byte(secretString), nil
		})
		if err != nil {
			err := errors.New("Invalid or expired token")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		} else if _, ok := token.Claims.(*CustomJWTClaims); !ok {
			err := errors.New("Invalid or expired token")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}
		ctx.Next()
	}
}

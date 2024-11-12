package router

import (
	"server/internal/user"

	"github.com/gin-gonic/gin"
)

var router *gin.Engine

func InitRouter(userHandler *user.UserHandler) {
	router = gin.Default()

	router.POST("/signup", userHandler.CreateUser)

}

func StartApp(address string) error {
	return router.Run(address)
}

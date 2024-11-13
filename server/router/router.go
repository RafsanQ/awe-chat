package router

import (
	"server/internal/user"

	"github.com/gin-gonic/gin"
)

var router *gin.Engine

func InitRouter(userHandler *user.UserHandler) {
	router = gin.Default()

	router.POST("/signup", userHandler.CreateUser)
	router.POST("/login", userHandler.Login)
	router.GET("/logout", userHandler.Logout)

}

func StartApp(address string) error {
	return router.Run(address)
}

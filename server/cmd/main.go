package main

import (
	"log"
	"server/db"
	"server/internal/user"
	"server/router"
)

func main() {
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not initialize database\n %s", err)
	}

	userRepository := user.NewUserRepository(dbConn.GetDB())
	userService := user.NewUserService(userRepository)
	userHandler := user.NewUserHandler(userService)

	router.InitRouter(userHandler)
	router.StartApp("0.0.0.0:8080")
}

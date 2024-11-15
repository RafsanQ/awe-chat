package internal

import (
	"context"
	"log"
	"server/db"
	"server/util"

	"github.com/gin-gonic/gin"
)

type Server struct {
	database *db.Database
	router   *gin.Engine
	config   *util.Config
}

func NewServer(config *util.Config) (*Server, error) {

	database, err := db.NewDatabase(context.Background(), config.DBSource)
	if err != nil {
		log.Fatalf("Could not initialize database\n %s", err)
		return nil, err
	}

	server := &Server{database: database, config: config}

	router := gin.Default()

	// Routes here
	router.POST("/signup", server.createUser)
	router.POST("/login", server.login)
	router.GET("/logout", server.logout)

	server.router = router
	return server, nil
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}

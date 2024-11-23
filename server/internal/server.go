package internal

import (
	"context"
	"log"
	db "server/db/sqlc"
	"server/util"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	databaseConnection *pgxpool.Pool
	databaseQueries    *db.Queries
	router             *gin.Engine
	config             *util.Config
}

func NewServer(config *util.Config) (*Server, error) {

	databaseConnection, databaseQueries, err := NewDatabase(context.Background(), config.DBSource)
	if err != nil {
		log.Fatalf("Could not initialize database\n %s", err)
		return nil, err
	}

	server := &Server{databaseConnection: databaseConnection, databaseQueries: databaseQueries, config: config}

	router := gin.Default()

	router.Use(ginBodyLogMiddleware)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{config.ClientAddress},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		AllowOriginFunc: func(origin string) bool {
			return origin == config.ClientAddress
		},
	}))

	// Routes here
	router.POST("/register", server.createUser)
	router.POST("/login", server.login)

	authRoutes := router.Group("/").Use(authMiddleWare(config.SecretKey))
	authRoutes.GET("/send-friend-request", server.requestFriendConnection)
	authRoutes.GET("/accept-friend-request", server.acceptFriendConnection)

	server.router = router
	return server, nil
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}

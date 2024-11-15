package main

import (
	"log"
	"server/internal"
	"server/util"
)

func main() {
	config, err := util.LoadConfig("./")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
		return
	}

	server, err := internal.NewServer(&config)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
		return
	}

	err = server.Start(config.ServerAddress)
	if err != nil {
		log.Fatalf("Server on %s Crashed.\nError: %v", config.ServerAddress, err)
	}
}

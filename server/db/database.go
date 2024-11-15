package db

import (
	"context"
	"log"
	db "server/db/sqlc"

	"github.com/jackc/pgx/v5"
)

type Database struct {
	Queries    *db.Queries
	connection *pgx.Conn
}

func NewDatabase(ctx context.Context, source string) (*Database, error) {

	conn, err := pgx.Connect(ctx, source)
	if err != nil {
		log.Fatal("Could not load configuration")
		return nil, err
	}
	queries := db.New(conn)
	return &Database{connection: conn, Queries: queries}, nil
}

func (databaseInstance *Database) Close(ctx context.Context) {
	databaseInstance.connection.Close(ctx)
}

func (databaseInstance *Database) GetConnection() *pgx.Conn {
	return databaseInstance.connection
}

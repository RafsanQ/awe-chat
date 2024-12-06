package db

import (
	"context"
	"log"
	db "server/database/sqlc"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Config(source string) *pgxpool.Config {
	const defaultMaxConns = 10
	const defaultMinConns = 0
	const defaultMaxConnLifetime = time.Hour * 1
	const defaultMaxConnIdleTime = time.Minute * 30
	const defaultHealthCheckPeriod = time.Minute
	const defaultConnectTimeout = time.Second * 5

	dbConfig, err := pgxpool.ParseConfig(source)
	if err != nil {
		log.Fatal("Failed to create a config, error", err)
	}

	dbConfig.MaxConns = defaultMaxConns
	dbConfig.MinConns = defaultMinConns
	dbConfig.MaxConnLifetime = defaultMaxConnLifetime
	dbConfig.MaxConnIdleTime = defaultMaxConnIdleTime
	dbConfig.HealthCheckPeriod = defaultHealthCheckPeriod
	dbConfig.ConnConfig.ConnectTimeout = defaultConnectTimeout

	return dbConfig
}

type Database struct {
	Queries        *db.Queries
	connectionPool *pgxpool.Pool
}

func NewDatabase(ctx context.Context, source string) (*Database, error) {

	conn, err := pgxpool.NewWithConfig(ctx, Config(source))
	if err != nil {
		log.Fatal("Could not connect to the database")
		return nil, err
	}
	queries := db.New(conn)
	return &Database{connectionPool: conn, Queries: queries}, nil
}

func (databaseInstance *Database) Close(ctx context.Context) {
	databaseInstance.connectionPool.Close()
}

func (databaseInstance *Database) GetConnection() *pgxpool.Pool {
	return databaseInstance.connectionPool
}

package db

import (
	"database/sql"

	_ "github.com/lib/pq"
)

type Database struct {
	db *sql.DB
}

func NewDatabase() (*Database, error) {
	db, err := sql.Open("postgres", "postgresql://root:9cd4c26428@localhost:5433/chat-app?sslmode=disable")
	if err != nil {
		return nil, err
	}
	return &Database{db: db}, nil
}

func (databaseInstance *Database) Close() {
	databaseInstance.db.Close()
}

func (databaseInstance *Database) GetDB() *sql.DB {
	return databaseInstance.db
}

postgresinit:
	docker run --name chat-app -p 5433:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=9cd4c26428 -d postgres

postgres:
	docker exec -it chat-app psql

createdb:
	docker exec -it chat-app createdb --username=root --owner=root chat-app

dropdb:
	docker exec -it chat-app dropdb chat-app

migrateup:
	 migrate -path db/migrations -database "postgresql://root:9cd4c26428@localhost:5433/chat-app?sslmode=disable" -verbose up

migratedown:
	 migrate -path db/migrations -database "postgresql://root:9cd4c26428@localhost:5433/chat-app?sslmode=disable" -verbose down

dev:
	go run .\cmd\main.go

.PHONY: postgresinit postgres createdb dropdb migrateup migratedown
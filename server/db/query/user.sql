-- name: CreateUser :one
INSERT INTO users (
    email, username, password) VALUES ($1, $2, $3) 
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: DeleteUserByEmail :exec
DELETE FROM users WHERE email = $1;

-- name: SearchUsers :many
SELECT email, username FROM users
WHERE (email ILIKE sqlc.arg(search_string) OR username ILIKE sqlc.arg(search_string)) AND email <> $1
LIMIT 100;

-- name: RequestFriendConnection :exec
INSERT INTO friend_connections (user_email_from, user_email_to) VALUES ($1, $2);

-- name: ConfirmFriendConnection :exec
UPDATE friend_connections SET confirmed = true WHERE user_email_from = $1 AND user_email_to = $2;

-- name: DeleteFriendConnection :exec
DELETE FROM friend_connections WHERE user_email_from = $1 AND user_email_to = $2;

-- name: GetFriendConnections :many
SELECT * FROM friend_connections WHERE (user_email_from = $1 AND user_email_to = $2) OR (user_email_from = $2 AND user_email_to = $1);

-- name: GetPendingFriendRequests :many
SELECT users.email, users.username FROM friend_connections JOIN users ON users.email = friend_connections.user_email_to
WHERE user_email_to = $1 AND confirmed = FALSE;

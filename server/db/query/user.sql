-- name: CreateUser :one
INSERT INTO users (
    email, username, password) VALUES ($1, $2, $3) 
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: DeleteUserByEmail :exec
DELETE FROM users WHERE email = $1;

-- name: RequestFriendConnection :exec
INSERT INTO friend_connections (user_email_from, user_email_to) VALUES ($1, $2);

-- name: ConfirmFriendConnection :exec
UPDATE friend_connections SET confirmed = true WHERE user_email_from = $1 AND user_email_to = $2;

-- name: DeleteFriendConnection :exec
DELETE FROM friend_connections WHERE user_email_from = $1 AND user_email_to = $2;


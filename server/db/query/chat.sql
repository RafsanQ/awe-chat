-- name: CreateChat :one
INSERT INTO chats DEFAULT VALUES
RETURNING *;

-- name: CreateChatWithAdmin :one
INSERT INTO chats (admin_email) VALUES ($1)
RETURNING *;

-- name: UpdateChat :exec
UPDATE chats SET admin_email = $2 WHERE id = $1;

-- name: GetChatById :one
SELECT * FROM chats WHERE id = $1 LIMIT 1;

-- name: DeleteChatById :exec
DELETE FROM chats WHERE id = $1;

-- name: CreateChatAccess :one
INSERT INTO chat_accesses (chat_id, user_email, is_direct_message)
VALUES ($1, $2, $3)
RETURNING *;

-- name: DeleteChatAccess :exec
DELETE FROM chat_accesses WHERE chat_id = $1 AND user_email = $2;

-- name: GetChatAccessByUserId :many
SELECT * FROM chat_accesses WHERE user_email = $1;

-- name: GetChatAccessesByEmail :many
SELECT * FROM chat_accesses WHERE user_email = $1;

-- name: CreateMessage :one
INSERT INTO messages (chat_id, sender_email, content) VALUES ($1, $2, $3)
RETURNING *;

-- name: DeleteMessage :exec
DELETE FROM messages WHERE id = $1;

-- name: GetMessagesByChatId :one
SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC;


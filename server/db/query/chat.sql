-- name: CreateChat :one
INSERT INTO chats DEFAULT VALUES
RETURNING *;

-- name: CreateChatWithAdmin :one
INSERT INTO chats (admin_email) VALUES ($1)
RETURNING *;

-- name: UpdateChat :exec
UPDATE chats SET admin_email = $2, is_group_chat = $3
WHERE id = $1;

-- name: GetChatById :one
SELECT * FROM chats WHERE id = $1 LIMIT 1;

-- name: DeleteChatById :exec
DELETE FROM chats WHERE id = $1;

-- name: CreateChatAccess :one
INSERT INTO chat_accesses (chat_id, user_email) VALUES ($1, $2)
RETURNING *;

-- name: DeleteChatAccess :exec
DELETE FROM chat_accesses WHERE chat_id = $1 AND user_email = $2;

-- name: GetChatAccessesByEmail :many
SELECT * FROM chat_accesses WHERE user_email = $1;

-- name: AddMessage :one
INSERT INTO messages (chat_id, sender_email, content) VALUES ($1, $2, $3)
RETURNING *;

-- name: DeleteMessage :exec
DELETE FROM messages WHERE id = $1;

-- name: GetMessagesByChatId :many
SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC;


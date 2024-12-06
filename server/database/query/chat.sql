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
SELECT chat_accesses.chat_id, users.email, users.username, chat_accesses.last_message_time
FROM chat_accesses
    JOIN users ON chat_accesses.user_email = users.email
WHERE chat_accesses.chat_id IN (SELECT chat_accesses.chat_id FROM chat_accesses WHERE chat_accesses.user_email = $1)
    AND chat_accesses.user_email <> $1
ORDER BY chat_accesses.last_message_time DESC
LIMIT 100;

-- name: GetChatAccessesByEmailWithSearchString :many
SELECT chat_accesses.chat_id, users.email, users.username, chat_accesses.last_message_time
FROM chat_accesses
    JOIN users ON chat_accesses.user_email = users.email
WHERE chat_accesses.chat_id IN (SELECT chat_accesses.chat_id FROM chat_accesses WHERE chat_accesses.user_email = $1)
    AND chat_accesses.user_email <> $1
    AND (users.email ILIKE $2 OR users.username ILIKE $2)
ORDER BY chat_accesses.last_message_time DESC
LIMIT 100;


-- name: AddMessage :one
INSERT INTO messages (chat_id, sender_email, content) VALUES ($1, $2, $3)
RETURNING *;

-- name: DeleteMessage :exec
DELETE FROM messages WHERE id = $1;

-- name: GetMessagesByChatId :many
SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC;


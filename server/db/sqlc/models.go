// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type Chat struct {
	ID          pgtype.UUID `json:"id"`
	AdminEmail  pgtype.Text `json:"admin_email"`
	IsGroupChat bool        `json:"is_group_chat"`
}

type ChatAccess struct {
	ChatID          pgtype.UUID      `json:"chat_id"`
	UserEmail       string           `json:"user_email"`
	LastMessageTime pgtype.Timestamp `json:"last_message_time"`
	LastMessageID   pgtype.UUID      `json:"last_message_id"`
}

type FriendConnection struct {
	UserEmailFrom string `json:"user_email_from"`
	UserEmailTo   string `json:"user_email_to"`
	Confirmed     bool   `json:"confirmed"`
}

type Message struct {
	ID          pgtype.UUID      `json:"id"`
	ChatID      pgtype.UUID      `json:"chat_id"`
	Content     string           `json:"content"`
	SenderEmail string           `json:"sender_email"`
	CreatedAt   pgtype.Timestamp `json:"created_at"`
}

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

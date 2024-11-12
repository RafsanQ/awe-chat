package user

import (
	"context"

	"github.com/google/uuid"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"user_name"`
	Email    string    `json:"email"`
	Password string    `json:"password"`
}

type CreateUserReq struct {
	Username string `json:"user_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CreateUserRes struct {
	ID       string `json:"id"`
	Username string `json:"user_name"`
	Email    string `json:"email"`
}

type UserRepository interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
}

type UserService interface {
	CreateUser(ctx context.Context, req *CreateUserReq) (*CreateUserRes, error)
}

package user

import (
	"context"
	"server/util"
	"time"
)

type userService struct {
	UserRepository
	timeout time.Duration
}

func NewUserService(repository UserRepository) UserService {
	return &userService{UserRepository: repository, timeout: time.Duration(2) * time.Second}
}

func (s *userService) CreateUser(ctx context.Context, req *CreateUserReq) (*CreateUserRes, error) {
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	hashedPassword, errHash := util.HashPassword(req.Password)

	if errHash != nil {
		return nil, errHash
	}

	newUser := &User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	res, err := s.UserRepository.CreateUser(ctx, newUser)
	if err != nil {
		return nil, err
	}

	return &CreateUserRes{ID: res.ID.String(), Username: res.Username, Email: res.Email}, nil
}

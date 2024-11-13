package user

import (
	"context"
	"fmt"
	"server/util"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type userService struct {
	UserRepository
	timeout time.Duration
}

const (
	secretKey = "secretkey"
)

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

type CustomJWTClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (s *userService) Login(c context.Context, req *LoginUserRequest) (*LoginUserResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	user, err := s.UserRepository.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	fmt.Printf("User %v", user)

	err = util.CheckPassword(req.Password, user.Password)
	if err != nil {
		return &LoginUserResponse{}, err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomJWTClaims{
		ID:       user.ID.String(),
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	signedString, err := token.SignedString([]byte(secretKey))

	if err != nil {
		return &LoginUserResponse{}, err
	}

	return &LoginUserResponse{ID: user.ID.String(), Username: user.Username, accessToken: signedString}, nil
}

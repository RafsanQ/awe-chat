package internal

import (
	"errors"
	"net/http"
	db "server/db/sqlc"

	"github.com/gin-gonic/gin"
	"golang.org/x/sync/errgroup"
)

type friendConnectionRequest struct {
	FriendEmail string `form:"friend_email" binding:"required,email"`
	UserEmail   string `form:"user_email" binding:"required,email"`
}

func (server *Server) requestFriendConnection(ctx *gin.Context) {
	var req friendConnectionRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.FriendEmail == req.UserEmail {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("Cannot request friend connection with yourself")))
		return
	}

	g, _ := errgroup.WithContext(ctx)

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.FriendEmail)
		return err
	})

	if err := g.Wait(); err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	res, _ := server.database.Queries.GetFriendConnections(ctx, db.GetFriendConnectionsParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})
	if len(res) > 0 {
		if res[0].Confirmed {
			ctx.JSON(http.StatusConflict, errorResponse(errors.New("Already a friend")))
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"message": "Friend Request Already Sent",
		})
		return
	}

	err := server.database.Queries.RequestFriendConnection(ctx, db.RequestFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Friend Request Sent",
	})
}

func (server *Server) acceptFriendConnection(ctx *gin.Context) {
	var req friendConnectionRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.FriendEmail == req.UserEmail {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("Cannot request friend connection with yourself")))
		return
	}

	g, _ := errgroup.WithContext(ctx)

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.UserEmail)
		return err
	})

	g.Go(func() (err error) {
		_, err = server.database.Queries.GetUserByEmail(ctx, req.FriendEmail)
		return err
	})

	g.Go(func() (err error) {
		res, _ := server.database.Queries.GetFriendConnections(ctx, db.GetFriendConnectionsParams{
			UserEmailFrom: req.FriendEmail,
			UserEmailTo:   req.UserEmail,
		})
		if len(res) == 0 {
			return errors.New("Friend connection has not been requested")
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	// Transaction
	tx, err := server.database.GetConnection().Begin(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer tx.Rollback(ctx)

	qtx := server.database.Queries.WithTx(tx)
	err = qtx.ConfirmFriendConnection(ctx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.FriendEmail,
		UserEmailTo:   req.UserEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = qtx.RequestFriendConnection(ctx, db.RequestFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = qtx.ConfirmFriendConnection(ctx, db.ConfirmFriendConnectionParams{
		UserEmailFrom: req.UserEmail,
		UserEmailTo:   req.FriendEmail,
	})

	newChatRoom, err := qtx.CreateChat(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	_, err = qtx.CreateChatAccess(ctx, db.CreateChatAccessParams{
		ChatID:    newChatRoom.ID,
		UserEmail: req.UserEmail,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	_, err = qtx.CreateChatAccess(ctx, db.CreateChatAccessParams{
		ChatID:    newChatRoom.ID,
		UserEmail: req.FriendEmail,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = tx.Commit(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Friend Request Accepted",
	})
}

type getPendingFriendRequestsRequest struct {
	UserEmail string `form:"user_email" binding:"required,email"`
}

func (server *Server) getPendingFriendRequests(ctx *gin.Context) {
	var req getPendingFriendRequestsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	res, err := server.database.Queries.GetPendingFriendRequests(ctx, req.UserEmail)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, res)
}

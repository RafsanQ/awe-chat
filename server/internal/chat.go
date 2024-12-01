package internal

import (
	"net/http"
	db "server/db/sqlc"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

type GetChatAccessesByEmailWithSearchStringParams struct {
	UserEmail    string `form:"user_email" binding:"required,email"`
	SearchString string `form:"search_string"`
}

func (server *Server) getChatsAccessesByEmail(ctx *gin.Context) {
	var req GetChatAccessesByEmailWithSearchStringParams

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	type ChatAccessResult struct {
		ChatID          pgtype.UUID      `json:"chat_id"`
		Email           string           `json:"email"`
		Username        string           `json:"username"`
		LastMessageTime pgtype.Timestamp `json:"last_message_time"`
	}

	if req.SearchString == "" {
		chatAccesses, err := server.database.Queries.GetChatAccessesByEmail(ctx, req.UserEmail)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"chatAccesses": chatAccesses})
	} else {
		chatAccesses, err := server.database.Queries.GetChatAccessesByEmailWithSearchString(ctx, db.GetChatAccessesByEmailWithSearchStringParams{
			UserEmail: req.UserEmail,
			Email:     "%%" + req.SearchString + "%%",
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"chat_accesses": chatAccesses})
	}
}

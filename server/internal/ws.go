package internal

import (
	"net/http"
	"time"

	database "server/database"
	db "server/database/sqlc"
	"server/util"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Message struct {
	ID          string    `json:"id"`
	ChatID      string    `json:"chat_id"`
	Content     string    `json:"content"`
	SenderEmail string    `json:"sender_email"`
	IsRemoved   bool      `json:"is_removed"`
	CreatedAt   time.Time `json:"created_at"`
	ReadAt      time.Time `json:"read_at"`
}

type Client struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	ChatId   string `json:"chat_id"`
	Conn     *websocket.Conn
	Message  chan *Message
}

type ChatRoom struct {
	ChatId  string `json:"chat_id"`
	Clients map[string]*Client
}

type Hub struct {
	Rooms      map[string]*ChatRoom
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]*ChatRoom),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message, 5),
	}
}

func (hub *Hub) Run() {
	for {
		select {
		case client := <-hub.Register:
			if _, ok := hub.Rooms[client.ChatId]; ok {
				room := hub.Rooms[client.ChatId]
				if _, ok := room.Clients[client.Email]; !ok {
					room.Clients[client.Email] = client
				}
			} else {
				// Create a new room
			}

		case client := <-hub.Unregister:
			if _, ok := hub.Rooms[client.ChatId]; ok {
				room := hub.Rooms[client.ChatId]
				if _, ok := room.Clients[client.Email]; ok {

					// Broadcast message saying client has left the room
					if len(room.Clients) > 0 {
						hub.Broadcast <- &Message{
							Content:     "User has left the chat",
							ChatID:      client.ChatId,
							SenderEmail: client.Email,
							CreatedAt:   time.Now(),
						}
					}

					delete(room.Clients, client.Email)
					close(client.Message)
				}
			}

		case message := <-hub.Broadcast:
			roomId := message.ChatID
			if _, ok := hub.Rooms[roomId]; ok {
				for _, client := range hub.Rooms[roomId].Clients {
					client.Message <- message
				}
			}
		}
	}
}

func (hub *Hub) CreateRoom(chatId string, user db.User, conn *websocket.Conn) *ChatRoom {

	room := &ChatRoom{
		ChatId:  chatId,
		Clients: make(map[string]*Client),
	}
	*hub.Rooms[chatId] = *room
	return room
}

type WebSocketHandler struct {
	hub      *Hub
	config   *util.Config
	Database *database.Database
}

func CreateWebSocketHandler(config *util.Config, database *database.Database) *WebSocketHandler {
	return &WebSocketHandler{
		hub:      NewHub(),
		config:   config,
		Database: database,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")

		return origin == "http://localhost:3000"
	},
}

type JoinRoomRequest struct {
	ChatId    string `json:"chat_id" binding:"required"`
	UserEmail string `json:"user_email" binding:"required,email"`
}

func (webSocketHandler *WebSocketHandler) JoinRoom(c *gin.Context) {

	var req JoinRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	user, err := webSocketHandler.Database.Queries.GetUserByEmail(c, req.UserEmail)
	if err != nil {
		c.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	client := &Client{
		Conn:     conn,
		Message:  make(chan *Message, 10),
		ChatId:   req.ChatId,
		Email:    user.Email,
		Username: user.Username,
	}

}

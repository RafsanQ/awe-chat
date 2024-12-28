package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	dbConnection "server/database"
	databaseTypes "server/database/sqlc"
	"server/util"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgtype"
)

var (
	readBufferSize  = 1024
	writeBufferSize = 1024
)

type ClientList map[*Client]bool
type Client struct {
	conn    *websocket.Conn
	manager *WebSocketManager
	egress  chan []byte
}

func NewClient(conn *websocket.Conn, manager *WebSocketManager) *Client {
	return &Client{
		conn:    conn,
		manager: manager,
		egress:  make(chan []byte),
	}
}

type MessageParams struct {
	ChatID      string `json:"chatId"`
	Content     string `json:"content"`
	SenderEmail string `json:"senderEmail"`
}

func addMessageToDb(database *dbConnection.Database, chatId pgtype.UUID, content string, senderEmail string) (*databaseTypes.Message, error) {
	ctx := context.Background()
	tx, err := database.GetConnection().Begin(ctx)
	if err != nil {
		return &databaseTypes.Message{}, err
	}
	defer tx.Rollback(ctx)

	qtx := database.Queries.WithTx(tx)

	newMessage, err := qtx.AddMessage(ctx, databaseTypes.AddMessageParams{
		ChatID:      chatId,
		Content:     content,
		SenderEmail: senderEmail,
	})

	if err != nil {
		return &databaseTypes.Message{}, err
	}

	err = qtx.UpdateLastMessageTime(ctx, databaseTypes.UpdateLastMessageTimeParams{
		ChatID:          chatId,
		LastMessageTime: newMessage.CreatedAt,
	})

	if err != nil {
		return &databaseTypes.Message{}, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return &databaseTypes.Message{}, err
	}

	return &newMessage, nil
}

func (client *Client) readMessages() {
	defer client.manager.removeClient(client)
	for {
		_, payload, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading from websocket: %v", err)
			}
			break
		}

		var messageParams MessageParams
		err = json.Unmarshal(payload, &messageParams)
		if err != nil {
			log.Println("Error unmarshalling JSON:", err)
			continue
		}

		chatIdUuid, err := util.StringToPgUuid(messageParams.ChatID)

		if err != nil {
			log.Println("Error converting chat ID to UUID:", err)
			continue
		}

		chatRoom, ok := client.manager.ChatRooms[messageParams.ChatID]
		if !ok {
			log.Println("Unable to find chat")
			continue
		}

		newMessage, err := addMessageToDb(client.manager.Server.database, chatIdUuid, messageParams.Content, messageParams.SenderEmail)
		if err != nil {
			log.Println("Error adding message to database:", err)
			continue
		}

		fmt.Println(newMessage)

		newMessageBytes, err := json.Marshal(newMessage)
		if err != nil {
			log.Println("Error marshalling new message:", err)
			continue
		}

		for currentClient := range chatRoom.Clients {
			currentClient.egress <- newMessageBytes
		}

	}
}

func (client *Client) writeMessages() {
	defer client.manager.removeClient(client)
	for {
		select {
		case message, ok := <-client.egress:
			if !ok {
				if err := client.conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Printf("Error closing websocket: %v", err)
					break
				}
				return
			}
			err := client.conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Printf("Error writing to websocket: %v", err)
				break
			}

			log.Println("Message sent to websocket")
			log.Println(string(message))
		}
	}
}

type ChatRoom struct {
	ChatId  string
	Clients ClientList
	manager *WebSocketManager
}

func NewChatRoom(chatId string, manager *WebSocketManager) *ChatRoom {
	return &ChatRoom{
		ChatId:  chatId,
		Clients: make(ClientList),
		manager: manager,
	}
}

func (room *ChatRoom) addClient(client *Client) {
	room.Clients[client] = true
}

func (room *ChatRoom) removeClient(client *Client) {
	if _, ok := room.Clients[client]; ok {
		delete(room.Clients, client)
	}
}

type ChatRoomList map[string]*ChatRoom
type WebSocketManager struct {
	Server           *Server
	ConnectedClients ClientList
	ChatRooms        ChatRoomList
	sync.RWMutex
}

func NewWebSocketManager(server *Server) *WebSocketManager {
	return &WebSocketManager{
		Server:           server,
		ConnectedClients: make(ClientList),
		ChatRooms:        make(ChatRoomList),
	}
}

func (m *WebSocketManager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	m.ConnectedClients[client] = true
}

func (m *WebSocketManager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	if _, ok := m.ConnectedClients[client]; ok {
		client.conn.Close()
		delete(m.ConnectedClients, client)
	}
}

type serverWebSocketReq struct {
	UserEmail string `form:"user_email" binding:"required"`
}

func (m *WebSocketManager) serveWebSocket(ctx *gin.Context) {
	var req serverWebSocketReq
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Handle new connections
	log.Println("New Connection")

	webSocketUpgrader := websocket.Upgrader{
		ReadBufferSize:  readBufferSize,
		WriteBufferSize: writeBufferSize,
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			return origin == m.Server.config.ClientAddress
		},
	}

	conn, err := webSocketUpgrader.Upgrade(ctx.Writer, ctx.Request, nil)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	client := NewClient(conn, m)
	m.addClient(client)

	chats, err := m.Server.database.Queries.GetChatAccessesByEmail(ctx, req.UserEmail)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	m.Lock()
	for _, chat := range chats {
		chatId := util.PgUuidToString(chat.ChatID)
		chatRoom, ok := m.ChatRooms[chatId]
		if !ok {
			m.ChatRooms[chatId] = NewChatRoom(chatId, m)
			chatRoom = m.ChatRooms[chatId]
		}
		chatRoom.addClient(client)
	}
	m.Unlock()

	// Start reading and writing goroutines
	go client.readMessages()
	go client.writeMessages()
}

package internal

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

func (client *Client) readMessages() {
	defer client.manager.removeClient(client)
	for {
		messageType, payload, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading from websocket: %v", err)
			}
			break
		}

		for currentClient := range client.manager.Clients {
			currentClient.egress <- payload
		}
		log.Println(messageType)
		log.Println(string(payload))
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

type WebSocketManager struct {
	Server  *Server
	Clients ClientList
	sync.RWMutex
}

func NewWebSocketManager(server *Server) *WebSocketManager {
	return &WebSocketManager{
		Server:  server,
		Clients: make(ClientList),
	}
}

func (m *WebSocketManager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	m.Clients[client] = true
}

func (m *WebSocketManager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	if _, ok := m.Clients[client]; ok {
		client.conn.Close()
		delete(m.Clients, client)
	}
}

func (m *WebSocketManager) serveWebSocket(ctx *gin.Context) {
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

	// Start reading and writing goroutines
	go client.readMessages()
	go client.writeMessages()
}

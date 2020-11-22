"use strict";

const WebSocket = require("ws")
const Room = require("./room")

const WebServer = new WebSocket.Server({port: 7070})

WebServer.rooms = {
    chatRooms: new Map,
    notifications: new Room,
    system: new Room,
}

const ENTER_CHAT = "ENTER_CHAT"
const EXIT_CHAT = "EXIT_CHAT"
const ENTER_NOTIFICATIONS = "ENTER_NOTIFICATIONS"
const EXIT_NOTIFICATIONS = "EXIT_NOTIFICATIONS"
const MESSAGE = "MESSAGE"

WebServer.on('connection', function connection(client) {
    
    
    client.on('message', function incoming(data) {
        const message = JSON.parse(data)

        if(message.type === ENTER_NOTIFICATIONS) {
            client.id = message.data.id
            WebServer.rooms.notifications.set(client.id, client)
        }

        if(message.type === EXIT_NOTIFICATIONS) {
            WebServer.rooms.notifications.delete(client.id)
        }

        if(message.type === ENTER_CHAT) {
            client.id = message.data.id
            client.chatId = message.data.chatId

            if(!WebServer.rooms.chatRooms.has(client.chatId)) {
                WebServer.rooms.chatRooms.set(client.chatId, new Room)
            }

            WebServer.rooms.chatRooms.get(client.chatId).set(client.id, client)
            console.debug("chats", WebServer.rooms.chatRooms.size, "current chat clients", WebServer.rooms.chatRooms.get(client.chatId).size)
        }

        if(message.type === EXIT_CHAT) {
            if(WebServer.rooms.chatRooms.has(client.chatId)) {
                WebServer.rooms.chatRooms.get(client.chatId).delete(client.id)

                if(WebServer.rooms.chatRooms.get(client.chatId).size === 0) {
                    WebServer.rooms.chatRooms.delete(client.chatId)
                }
            }
        }

        if(message.type === MESSAGE && WebServer.rooms.chatRooms.has(client.chatId)) {
            WebServer.rooms.chatRooms.get(client.chatId).exclude(client.id).send(message)
        }

        console.debug(WebServer.rooms.notifications)
        
    })

    client.on("close", function close(code, reason) {
        if(WebServer.rooms.chatRooms.has(client.chatId)) {
            WebServer.rooms.chatRooms.get(client.chatId).delete(client.id)

            if(WebServer.rooms.chatRooms.get(client.chatId).size === 0) {
                WebServer.rooms.chatRooms.delete(client.chatId)
            }
        }

        WebServer.rooms.notifications.delete(client.id)
        
        console.debug("chats", WebServer.rooms.chatRooms.size, "client", client.id, "closed")
    })
})

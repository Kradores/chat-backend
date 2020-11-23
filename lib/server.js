"use strict";

const WebSocket = require("ws")
const Room = require("./room")

const WebServer = new WebSocket.Server({port: 7070})

WebServer.rooms = {
    users: new Room,
    chatRooms: new Map,
    notifications: new Room,
    system: new Room,
}

const INIT_CLIENT = "INIT_CLIENT"
const ENTER_CHAT = "ENTER_CHAT"
const EXIT_CHAT = "EXIT_CHAT"
const ENTER_NOTIFICATIONS = "ENTER_NOTIFICATIONS"
const EXIT_NOTIFICATIONS = "EXIT_NOTIFICATIONS"
const MESSAGE = "MESSAGE"

WebServer.on('connection', function connection(client) {
    
    
    client.on('message', function incoming(data) {
        const message = JSON.parse(data)

        if(message.type === INIT_CLIENT) {
            client.id = message.data.id
            WebServer.rooms.users.set(client.id, client)
        }

        if(message.type === ENTER_CHAT) {
            WebServer.rooms.users.get(client.id).chatId = message.data.chat_id
            console.debug(WebServer.rooms.users)
            console.debug("clients", WebServer.rooms.users.size)
        }

        if(message.type === EXIT_CHAT) {
            WebServer.rooms.users.get(client.id).chatId = null
            console.debug("clients", WebServer.rooms.users.size)
        }

        if(message.type === MESSAGE) {
            WebServer.rooms.users.sendTo(message, message.data.reciever_id)
        }

    })

    client.on("close", function close(code, reason) {
        if(WebServer.rooms.users.has(client.id)) {
            WebServer.rooms.users.delete(client.id)
        }

        console.debug("clients", WebServer.rooms.users.size, "client", client.id, "closed")
    })
})

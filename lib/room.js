"use strict";

/**
 * Class representing a room with WebSockets
 * 
 * @extends Map<Number,WebSocket>
 * 
 */
class Room extends Map {
    /**
     * Send message to all WebSockets in room
     */
    send(message = "") {
        message = JSON.stringify(message)
        this.forEach((client, id) => {
            if(id === this.excludeClientId) {
                delete this.excludeClientId
                return
            }
            client.send(message)
        })
    }

    /**
     * Call this function before send to all to exclude one WebSocket by id\
     * Sets excludeClientId, which is unset on send
     * @param {Number} clientId 
     */
    exclude(clientId) {
        this.excludeClientId = clientId
        return this
    }
}

module.exports = Room
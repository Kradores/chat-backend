const socket = new WebSocket("ws://localhost:7070")
const conversations = document.querySelectorAll(".conversation")
const submit = document.querySelector("button#send-message")
const textInput = document.querySelector("#message-input")
const messages = document.querySelector(".messages")
const chatId = document.querySelector("#chat-id-input")
const id = document.querySelector("#id-input")
// id.value = Math.floor(Math.random() * 1000000)
const activeChat = {
    id: null,
    sender_id: null,
    reciever_id: null,
}

submit.addEventListener("click", sendMessage)

conversations.forEach(conversation => {
    conversation.addEventListener("click", () => {
        activeChat.id = chatId.value = conversation.querySelector(".chat-id").innerText
        activeChat.sender_id = id.value
        activeChat.reciever_id = 
        messages.innerHTML = ""
        socket.send(JSON.stringify({
            type: "EXIT_CHAT",
        }))

        setTimeout(() => {
            socket.send(JSON.stringify({
                type: "ENTER_CHAT",
                data: {
                    id: id.value, 
                    chatId: chatId.value, 
                }
            }))
        }, 500)
        
    })

    conversation.querySelectorAll(".user-id").forEach(userElem => {
        if(userElem.innerText == id.value) {
            console.debug("show")
            conversation.style.display = "block"
        }
    })
})

function sendMessage() {
    socket.send(JSON.stringify({
        type: "MESSAGE",
        data: {
            id: id.value, 
            text: textInput.value,
        }
    }))

    const newMessage = document.createElement("P")
    newMessage.innerText = "Me: " + textInput.value
    messages.appendChild(newMessage)

    textInput.value = ""
}

socket.onmessage = ({data}) => {
    const recieved = JSON.parse(data)
    const newMessage = document.createElement("P")
    newMessage.innerText = recieved.data.id + ": " + recieved.data.text
    messages.appendChild(newMessage)
}

socket.onopen = (data) => {
    socket.send(JSON.stringify({
        type: "ENTER_NOTIFICATIONS",
        data: {
            id: id.value, 
        }
    }))
}

socket.onclose = (data) => {
    console.debug(data)
}
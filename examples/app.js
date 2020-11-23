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

        conversation.querySelectorAll(".user-id").forEach(userElem => {
            if(userElem.innerText != id.value) {
                activeChat.reciever_id = userElem.innerText
            }
        })
        
        messages.innerHTML = ""
        socket.send(JSON.stringify({
            type: "EXIT_CHAT",
        }))

        setTimeout(() => {
            socket.send(JSON.stringify({
                type: "ENTER_CHAT",
                data: {
                    id: id.value, 
                    chat_id: chatId.value, 
                }
            }))
        }, 500);
        
        
    })

    conversation.querySelectorAll(".user-id").forEach(userElem => {
        if(userElem.innerText == id.value) {
            conversation.style.display = "block"
        }
    })
})

function sendMessage() {
    socket.send(JSON.stringify({
        type: "MESSAGE",
        data: {
            chat_id: activeChat.id,
            sender_id: activeChat.sender_id, 
            reciever_id: activeChat.reciever_id,
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
    if(recieved.data.chat_id === activeChat.id) {
        const newMessage = document.createElement("P")
        newMessage.innerText = recieved.data.sender_id + ": " + recieved.data.text
        messages.appendChild(newMessage)
    } else {
        conversations.forEach(conversation => {
            if(conversation.querySelector(".chat-id").innerText == recieved.data.chat_id) {
                conversation.querySelector(".unread").innerText = Number(conversation.querySelector(".unread").innerText) + 1
            }
        })
    }
}

socket.onopen = (data) => {
    socket.send(JSON.stringify({
        type: "INIT_CLIENT",
        data: {
            id: id.value, 
        }
    }))
}

socket.onclose = (data) => {
    console.debug(data)
}
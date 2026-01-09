import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket;
    room: string;
}

// let userCount = 0;
let allSockets: User[] = [];

wss.on("connection", (socket) => {
   

    socket.on("message", (message) => {
        // @ts-ignore
        const parsedMessage = JSON.parse(message);
        if(parsedMessage.type == "join") {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }

        if(parsedMessage.type == "chat"){
            let currentUserRoom = null;
            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i].socket == socket){
                    currentUserRoom = allSockets[i].room;
                }
            }

            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i].room == currentUserRoom){
                    allSockets[i].socket.send(
                        JSON.stringify({
                            senderId: parsedMessage.payload.senderId,
                            message: parsedMessage.payload.message
                        })
                    );
                }
            }
        }
    })
})
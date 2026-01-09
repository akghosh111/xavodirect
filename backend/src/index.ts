import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let waitingQueue: WebSocket[] = [];
const pairs = new Map<WebSocket, WebSocket>();


function pairUsers() {
  while (waitingQueue.length >= 2) {
    const user1 = waitingQueue.shift()!;
    const user2 = waitingQueue.shift()!;

    pairs.set(user1, user2);
    pairs.set(user2, user1);

    user1.send(
      JSON.stringify({
        type: "system",
        message: "Connected to a stranger",
      })
    );

    user2.send(
      JSON.stringify({
        type: "system",
        message: "Connected to a stranger",
      })
    );
  }
}


function unpair(socket: WebSocket) {
  const partner = pairs.get(socket);

  if (partner) {
    pairs.delete(partner);
    pairs.delete(socket);

    
    waitingQueue.push(partner);

    partner.send(
      JSON.stringify({
        type: "system",
        message: "Stranger disconnected. Finding a new match...",
      })
    );
  }

  
  waitingQueue.push(socket);
  pairUsers();
}


wss.on("connection", (socket) => {
  
  waitingQueue.push(socket);
  pairUsers();

  socket.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    
    if (data.type === "chat") {
      const partner = pairs.get(socket);
      if (!partner) return;

      partner.send(
        JSON.stringify({
          senderId: data.payload.senderId,
          message: data.payload.message,
        })
      );
    }

    
    if (data.type === "skip") {
      unpair(socket);
    }
  });

  
  socket.on("close", () => {
    const partner = pairs.get(socket);

    if (partner) {
      pairs.delete(partner);
      pairs.delete(socket);

      waitingQueue.push(partner);

      partner.send(
        JSON.stringify({
          type: "system",
          message: "Stranger disconnected. Finding a new match...",
        })
      );

      pairUsers();
    }

    
    waitingQueue = waitingQueue.filter((s) => s !== socket);
  });
});

console.log("WebSocket server running on ws://localhost:8080");

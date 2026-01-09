import { useEffect, useRef, useState } from "react";


type ChatMessage = {
  senderId: string;
  message: string;
};


function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const myIdRef = useRef(crypto.randomUUID());
  const wsRef = useRef<WebSocket | null>(null);

  const [strangerMap, setStrangerMap] = useState<Record<string, string>>({});
  const strangerCountRef = useRef(1);

  
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      
      if (data.type === "system") {
        setMessages((m) => [
          ...m,
          { senderId: "__system__", message: data.message },
        ]);
        return;
      }

      
      if (data.senderId !== myIdRef.current) {
        setStrangerMap((prev) => {
          if (prev[data.senderId]) return prev;

          return {
            ...prev,
            [data.senderId]: `Stranger #${strangerCountRef.current++}`,
          };
        });
      }

      setMessages((m) => [...m, data]);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, []);

  
  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      senderId: myIdRef.current,
      message: input,
    };

    
    setMessages((m) => [...m, msg]);

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: msg,
      })
    );

    setInput("");
  };

  
  return (
    <div className="bg-neutral-900 text-white min-h-screen overflow-x-hidden">
      <div className="container mx-auto max-w-3xl pb-44 px-2">

        {messages.map((msg, i) => {
          
          if (msg.senderId === "__system__") {
            return (
              <div key={i} className="text-center text-gray-400 my-3 text-sm">
                {msg.message}
              </div>
            );
          }

          const isMe = msg.senderId === myIdRef.current;
          const name = isMe ? "Me" : strangerMap[msg.senderId];

          return (
            <div
              key={i}
              className={`m-4 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded p-3 ${
                  isMe ? "bg-blue-500" : "bg-neutral-700"
                }`}
              >
                <div className="text-xs opacity-70 mb-1">{name}</div>
                <div>{msg.message}</div>
              </div>
            </div>
          );
        })}

      </div>

      
      <div className="fixed inset-x-0 bottom-0 flex justify-center bg-neutral-900">
        <div className="bg-neutral-800 p-2 rounded-2xl w-full max-w-3xl mb-5">
          <textarea
            className="w-full resize-none outline-0 p-3 bg-neutral-800"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <div className="flex justify-end mt-2">
            <button
              onClick={sendMessage}
              className="bg-white px-4 py-1 rounded-full text-black hover:bg-gray-300 mr-2"
            >
              Send
            </button>

            <button
              onClick={() => {
                wsRef.current?.send(JSON.stringify({ type: "skip" }));
                setMessages([]);
                setStrangerMap({});
                strangerCountRef.current = 1;
              }}
              className="bg-white px-4 py-1 rounded-full text-black hover:bg-gray-300"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

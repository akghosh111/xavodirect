import { useEffect, useRef, useState } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>(["hi there", "hello"]);
  const [input, setInput] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      setMessages((m) => [...m, event.data]);
    };

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomId: "1" }
        })
      );
    };

    return () => ws.close();
  }, []);

  return (
    <div className="bg-neutral-900 text-white min-h-screen overflow-x-hidden">
      <div className="container mx-auto max-w-3xl pb-44 px-2">
        {messages.map((message, i) => (
          <div key={i} className="m-10">
            <span className="bg-white text-black rounded p-4">
              {message}
            </span>
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center bg-neutral-900">
        <div className="bg-neutral-800 p-2 rounded-2xl w-full max-w-3xl mb-5">
          <textarea
            className="w-full resize-none outline-0 p-3"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!input.trim()) return;

                wsRef.current?.send(
                  JSON.stringify({
                    type: "chat",
                    payload: { message: input }
                  })
                );

                setInput("");
              }}
              className="bg-white px-4 py-1 rounded-full text-black hover:bg-gray-300"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

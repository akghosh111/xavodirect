import { useEffect, useRef, useState } from "react"


function App() {
  const [messages, setMessages] = useState(["hi there", "hello"]);

  const wsRef = useRef();

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080")
    ws.onmessage = (event) => {
      setMessages(m => [...m, event.data])
    }
    wsRef.current = ws;
    ws.onopen =() => {
      ws.send(JSON.stringify({
      type: "join",
      payload: {
        roomId: "1"
      }
    }))
    }
  }, [])

  return (
    <div className="">
      <div className="bg-neutral-900 text-white overflow-x-hidden min-h-screen">
      <div className="container mx-auto max-w-3xl pb-44 px-2" id="chat-container">
        {messages.map(message => <div className="m-10"><span className="bg-white text-black rounded p-4">{message}</span></div>)}
        
        <div className="fixed inset-x-0 bottom-0 flex items-center justify-center bg-neutral-900">
            <div className="bg-neutral-800 p-2 rounded-2xl w-full max-w-3xl mb-5">
                <textarea className="w-full resize-none outline-0 p-3" rows={2} id="input"></textarea>
                <div className="flex justify-end items-center">
                    <button onClick={() => {
                      const message = document.getElementById("input").value;
                      wsRef.current.send(JSON.stringify({
                        type: "chat",
                        payload: {
                          message: message
                        }
                      }))
                    }} id="ask" className="bg-white px-4 py-1 rounded-full text-black cursor-pointer hover:bg-gray-300">Ask</button>
                </div>
            </div>
        </div>
      </div>

    </div>
    </div>
    
  )
}

export default App

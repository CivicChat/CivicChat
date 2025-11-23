import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="chat-input-container">
      <input
        className="chat-input"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button className="send-btn" onClick={send}>
        Send
      </button>
    </div>
  );
}

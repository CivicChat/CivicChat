import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-bar">
      <input
        className="chat-input"
        placeholder="Type your message..."
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button className="send-btn" onClick={handleSend} disabled={disabled}>
        Send
      </button>
    </div>
  );
}

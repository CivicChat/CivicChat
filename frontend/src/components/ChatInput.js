import React, { useState } from "react";

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type your message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

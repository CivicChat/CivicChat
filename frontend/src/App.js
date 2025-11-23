import React, { useState } from "react";
import ChatMessage from "./components/ChatMessage.js/index.js";
import ChatInput from "./components/ChatInput.js";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");

  async function sendMessage(userMessage) {
    // Show user's message
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);

    // TEMPORARY mock response
    setMessages(prev => [
      ...prev,
      { sender: "bot", text: "Searching DC data..." }
    ]);
  }

  return (
    <div className="app-container">
      <h1>CivicChat DC</h1>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="bn">Bengali</option>
      </select>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <ChatMessage key={i} sender={msg.sender} text={msg.text} />
        ))}
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}

export default App;

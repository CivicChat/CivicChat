import React, { useState } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import "./App.css";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "bn", label: "Bengali" },
  { code: "zh-Hans", label: "Chinese (Simplified)" },
  { code: "zh-Hant", label: "Chinese (Traditional)" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "sw", label: "Swahili" }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    // TEMPORARY MOCK (backend will replace this)
    setIsSending(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Searching DC data (mock)… [${language}]` }
      ]);
      setIsSending(false);
    }, 700);
  };

  return (
    <div className="app-root">
      <div className="chat-shell">

        {/* HEADER */}
        <header className="chat-header">
          <div className="chat-header-main">
            <h1 className="chat-title">CivicChat DC</h1>
            <p className="chat-subtitle">
              Ask questions about elections, ballot items, and community services.
            </p>
          </div>

          <div className="language-block">
            <span>Language</span>
            <select
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* CHAT WINDOW */}
        <main className="chat-window">
          {messages.length === 0 ? (
            <div className="chat-empty">
              Ask: “Where do I vote?” or “What’s on my ballot?”
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage key={i} sender={msg.sender} text={msg.text} />
            ))
          )}
          {isSending && <ChatMessage sender="bot" text="Thinking… ●●●" />}
        </main>

        {/* INPUT */}
        <ChatInput onSend={sendMessage} disabled={isSending} />

      </div>
    </div>
  );
}

export default App;

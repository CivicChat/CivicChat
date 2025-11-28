// frontend/src/App.js
import React, { useState, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { AZURE_LANGUAGES } from "./languages";
import "./App.css";
import logo from "./civicchatlogo.png";

export default function App() {
  // -------------------------
  // LOCAL STORAGE HELPERS
  // -------------------------

  const loadStoredChats = () => {
    const stored = localStorage.getItem("civicchat_chats");
    return stored ? JSON.parse(stored) : [];
  };

  const loadStoredActiveChat = () => {
    const stored = localStorage.getItem("civicchat_active");
    return stored
      ? JSON.parse(stored)
      : {
          id: Date.now(),
          title: "New Chat",
          messages: [],
        };
  };

  const saveChats = (chats) => {
    localStorage.setItem("civicchat_chats", JSON.stringify(chats));
  };

  const saveActiveChat = (chat) => {
    localStorage.setItem("civicchat_active", JSON.stringify(chat));
  };

  // -------------------------
  // STATE
  // -------------------------

  const [chats, setChats] = useState(loadStoredChats());
  const [activeChat, setActiveChat] = useState(loadStoredActiveChat());
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals for rename
  const [renameChatId, setRenameChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // -------------------------
  // EFFECT: Save on change
  // -------------------------

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChat(activeChat);
  }, [activeChat]);

  // -------------------------
  // CHAT ACTIONS
  // -------------------------

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };
    setActiveChat(newChat);
    setChats([...chats, newChat]);
  };

  const switchChat = (chatId) => {
    const found = chats.find((c) => c.id === chatId);
    if (found) {
      setActiveChat(found);
    }
  };

  const deleteChat = (chatId) => {
    const updated = chats.filter((c) => c.id !== chatId);
    setChats(updated);

    // If deleting active chat, switch to another or create new
    if (activeChat.id === chatId) {
      if (updated.length > 0) {
        setActiveChat(updated[0]);
      } else {
        startNewChat();
      }
    }
  };

  const clearAllChats = () => {
    setChats([]);
    startNewChat();
  };

  const openRenameModal = (chat) => {
    setRenameChatId(chat.id);
    setRenameValue(chat.title);
  };

  const applyRename = () => {
    const updatedChats = chats.map((c) =>
      c.id === renameChatId ? { ...c, title: renameValue } : c
    );

    let updatedActive = activeChat;
    if (activeChat.id === renameChatId) {
      updatedActive = { ...activeChat, title: renameValue };
      setActiveChat(updatedActive);
    }

    setChats(updatedChats);
    setRenameChatId(null);
    setRenameValue("");
  };

  // -------------------------
  // SEND MESSAGE (REAL BACKEND)
  // -------------------------

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    setErrorMsg("");
    setIsLoading(true);

    // 1) Add user message optimistically
    const newUserMsg = { sender: "user", text: userMessage };
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newUserMsg],
    };
    setActiveChat(updatedChat);

    try {
      // Build simple history for backend (user/assistant only)
      const history = updatedChat.messages.map((m) => ({
        role: m.sender === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      const resp = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language,
          history,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || "Backend error");
      }

      const data = await resp.json();

      const botResponse = {
        sender: "bot",
        text: data.answer,
      };

      const updatedWithBot = {
        ...updatedChat,
        messages: [...updatedChat.messages, botResponse],
      };

      setActiveChat(updatedWithBot);
      setChats((prev) =>
        prev.map((c) => (c.id === updatedWithBot.id ? updatedWithBot : c))
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong talking to CivicChat.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------

  return (
    <div className="app-container">
      {/* ------------------------------------
          SIDEBAR
      ------------------------------------ */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} className="logo" alt="logo" />
          <h2>CivicChat</h2>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          + New chat
        </button>

        <button className="clear-chats-btn" onClick={clearAllChats}>
          Clear all chats
        </button>

        <div className="chat-history">
          {chats.length === 0 && <p>Your previous chats will appear here.</p>}

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${
                chat.id === activeChat.id ? "active-chat" : ""
              }`}
              onClick={() => switchChat(chat.id)}
            >
              <span>{chat.title}</span>

              <div className="chat-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openRenameModal(chat)}>Edit </button>
                <button onClick={() => deleteChat(chat.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------
          MAIN CHAT AREA
      ------------------------------------ */}
      <div className="chat-area">
        <div className="chat-header">
          <div>
            <h1>{activeChat.title}</h1>
            <p className="subtitle">
              A reliable space to ask questions about elections, ballot items,
              and local services.
            </p>
          </div>

        <div className="language-selector">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {AZURE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        </div>

        <div className="chat-window">
          {activeChat.messages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}

          {isLoading && <div className="typing-indicator">CivicChat is thinking…</div>}
          {errorMsg && <div className="error-banner">{errorMsg}</div>}
        </div>

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>

      {/* ------------------------------------
          RENAME MODAL
      ------------------------------------ */}
      {renameChatId !== null && (
        <div className="modal-background">
          <div className="modal">
            <h3>Rename chat</h3>

            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={applyRename}>Save</button>
              <button onClick={() => setRenameChatId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

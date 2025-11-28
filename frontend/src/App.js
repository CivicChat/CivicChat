import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { AZURE_LANGUAGES } from "./languages";
import "./App.css";
import logo from "./civicchatlogo.png";

const SUGGESTED_QUESTIONS = [
  "Who is the mayor?",
  "How do I register to vote?",
  "Where is my polling place?",
  "What elections are coming up?",
  "What is on the ballot?"
];

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

  const [renameChatId, setRenameChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const chatWindowRef = useRef(null);

  // -------------------------
  // EFFECT: SAVE ON CHANGE + AUTOSCROLL
  // -------------------------

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChat(activeChat);
  }, [activeChat]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop =
        chatWindowRef.current.scrollHeight;
    }
  }, [activeChat.messages]);

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
    setChats((prev) => [...prev, newChat]);
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
  // SEND MESSAGE + SUGGESTION CLICK
  // -------------------------

  const sendMessage = async (userMessage) => {
    const updatedChat = {
      ...activeChat,
      messages: [
        ...activeChat.messages,
        { sender: "user", text: userMessage },
      ],
    };

    setActiveChat(updatedChat);
    setChats((prev) =>
      prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
    );

    const typingBubble = {
      sender: "bot",
      text: "Thinking…",
    };

    const chatWithTyping = {
      ...updatedChat,
      messages: [...updatedChat.messages, typingBubble],
    };

    setActiveChat(chatWithTyping);
    setChats((prev) =>
      prev.map((c) => (c.id === chatWithTyping.id ? chatWithTyping : c))
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          lang: language,
          chatId: activeChat.id,
        }),
      });

      const data = await res.json();

      const finalChat = {
        ...updatedChat,
        messages: [
          ...updatedChat.messages,
          { sender: "bot", text: data.reply || "(No response)" },
        ],
      };

      setActiveChat(finalChat);
      setChats((prev) =>
        prev.map((c) => (c.id === finalChat.id ? finalChat : c))
      );
    } catch (e) {
      const errorChat = {
        ...updatedChat,
        messages: [
          ...updatedChat.messages,
          {
            sender: "bot",
            text: "Sorry, something went wrong with CivicChat.",
          },
        ],
      };

      setActiveChat(errorChat);
      setChats((prev) =>
        prev.map((c) => (c.id === errorChat.id ? errorChat : c))
      );
    }
  };

  const handleSuggestedClick = (text) => {
    sendMessage(text);
  };

  // -------------------------
  // RENDER
  // -------------------------

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} className="logo" alt="logo" />
          <div>
            <h2>CivicChat</h2>
            <p className="sidebar-subtitle">
              A reliable space to ask questions about elections, ballot items,
              and local services.
            </p>
          </div>
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

              <div
                className="chat-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => openRenameModal(chat)}>Edit</button>
                <button onClick={() => deleteChat(chat.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chat-area">
        <div className="chat-header">
          <div>
            <h1>{activeChat.title}</h1>
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

        {/* SUGGESTED QUESTIONS */}
        <div className="suggestions">
          <p className="suggestion-title">Suggested questions</p>
          <div className="suggestion-buttons">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                className="suggestion-btn"
                onClick={() => handleSuggestedClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="chat-window" ref={chatWindowRef}>
          {activeChat.messages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}
        </div>

        <ChatInput onSend={sendMessage} />
      </div>

      {/* RENAME MODAL */}
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

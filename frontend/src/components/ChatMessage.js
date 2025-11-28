import React from "react";

export default function ChatMessage({ sender, text, sources }) {
  const isUser = sender === "user";

  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      {text}

      {/* Optional source list under bot bubble */}
      {!isUser && sources && sources.length > 0 && (
        <div className="sources" style={{ marginTop: "6px", fontSize: "12px" }}>
          <strong>Sources:</strong>
          <ul style={{ marginTop: "4px", paddingLeft: "18px" }}>
            {sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563eb" }}
                >
                  {src.title || src.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

//ChatbotPage.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatContext } from "../context/ChatContext";
import SidebarChatHistory from "./SidebarChatHistory";
import "../styles/ChatbotPage.css";

export default function ChatbotPage({ user }) {
  const { messages, sendMessage, activeSessionId } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll otomatis saat messages berubah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeSessionId) return;

    sendMessage(input, activeSessionId);
    setInput("");
  };
  
  const messagesToDisplay =
    messages.length > 0
      ? messages
      : [
          {
            role: "assistant",
            message:
              "Halo 👋! Saya AI Tutor Farmasi. Silakan tanya apa saja tentang titrasi, prosedur laboratorium, atau analisis kandungan logam.",
          },
        ];

  return (
    <div className="chatbot-container">

      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <SidebarChatHistory user={user} />
      </div>

      {/* Chat Window */}
      <div className="chatbot-window">

        <div className="messages">
          {messagesToDisplay.map((msg, index) => (
            <div
              key={index}
              className={`chat-msg ${msg.role === "user" ? "user" : "bot"}`}
            >
              <div className="chat-bubble">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.message}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <input
            value={input}
            placeholder={activeSessionId ? "Tulis pesan..." : "Memuat chat..."}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && activeSessionId) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={false}
          />

          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!activeSessionId || !input.trim()}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </div>
      </div>

    </div>
  );
}


import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const userId = user.user_id;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, newMsg]);

    const question = input;
    setInput("");

    const response = await fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, user_id: userId }),
    });

    const data = await response.json();

    setMessages(prev => [
      ...prev,
      { sender: "bot", text: data.answer }
    ]);
  };

  return (
    <div className="chatwindow-wrapper">

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-msg ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <div className="chat-bubble">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-input-container">
        <input
          className="chat-input"
          placeholder="Ketik pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-btn" onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
}

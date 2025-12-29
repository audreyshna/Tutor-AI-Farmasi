import { createContext, useEffect, useState } from "react";

export const ChatContext = createContext();

export function ChatProvider({ user, children }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Helper: remove duplicate session_id
function filterUniqueSessions(list) {
  const map = new Map();
  list.forEach((s) => {
    if (!map.has(s.session_id)) {
      map.set(s.session_id, s);
    }
  });
  return Array.from(map.values());
}

  // Load session saat user login
  useEffect(() => {
    if (!user?.user_id) return;

    async function initChat() {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/sessions/${user.user_id}`);
        const data = await res.json();

        const uniqueSessions = filterUniqueSessions(
        Array.isArray(data.sessions) ? data.sessions : []);
        uniqueSessions.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setSessions(uniqueSessions);

        if (uniqueSessions.length > 0) {
          const initialSession = uniqueSessions[0].session_id;
          setActiveSessionId(initialSession);
          await loadMessages(initialSession);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Error loading chat sessions:", err);
      }
    }

    initChat();
  }, [user]);

  // Load messages
  async function loadMessages(sessionId) {
    if (!sessionId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${sessionId}`);
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }

  // Select session
  function selectSession(sessionId) {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    loadMessages(sessionId);
  }

  // New Chat (fix duplikasi session)
  async function newChat() {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      const data = await res.json();
      const newSession = data.session;
      newSession.created_at = new Date().toISOString();

      // Tambah session baru tanpa fetch ulang list
      setSessions((prev) => {
        // hindari duplikat berdasarkan session_id
        const merged = [newSession, ...prev];
        const unique = filterUniqueSessions(merged);
        unique.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return unique;
      });

      setActiveSessionId(newSession.session_id);
      setMessages([]);

      console.log("New chat created:", newSession.session_id);
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  }

  // Send Message
  async function sendMessage(text, sessionId) {
    const sid = sessionId || activeSessionId;
    if (!sid) return;

    setMessages(prev => [
      ...prev,
      { role: "user", message: text },
    ]);

    setSessions(prev =>{
      const updated = prev.map(s =>
        s.session_id === sid
          ? { ...s, first_message: text, created_at: new Date().toISOString() } 
          : s
      );
      updated.sort((a, b) =>
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
        return updated;
    });

    setMessages(prev => [
      ...prev,
      { role: "assistant", message: "...", typing: true, temp: true }
    ]);

    try {
      const res = await fetch(`http://localhost:5000/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          user_id: user.user_id,
          question: text,
        }),
      });

      const data = await res.json();
      
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.findIndex(m => m.temp);

        if (lastIndex !== -1) {
        updated[lastIndex] = {
          role: "assistant",
          message: data.answer,
          typing: false
        };
      }
      return updated;
    });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  async function deleteSession(sessionId) {
  try {
    await fetch(`http://localhost:5000/api/chat/delete/${sessionId}`, {
      method: "DELETE",
    });

    setSessions(prev => {
      const updated = prev.filter(s => s.session_id !== sessionId);
      updated.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      // Atur active session dengan updated list
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].session_id);
          loadMessages(updated[0].session_id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }

      return updated;
    });

  } catch (err) {
    console.error("Error deleting session:", err);
  }
}

  return (
    <ChatContext.Provider
      value={{
        sessions,
        messages,
        activeSessionId,
        selectSession,
        newChat,
        sendMessage,
        deleteSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
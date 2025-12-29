import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import "../styles/ChatbotPage.css";

export default function SidebarChatHistory({ user, sidebarOpen, setSidebarOpen }) {
  const {
    sessions,
    activeSessionId,
    selectSession,
    newChat,
    deleteSession,
  } = useContext(ChatContext);

  const [openMenu, setOpenMenu] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (openMenu && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);
  return (
    <div className="sidebar-wrapper" ref={wrapperRef}>

      {/* NEW CHAT BUTTON */}
      <button
        className="new-chat-btn"
        onClick={newChat}
      >
        + New Chat
      </button>

      <h6 className="history-title">Riwayat Chat</h6>

      {/* LIST HISTORY SESSION */}
      <div className="history-list">
        {sessions.length === 0 ? (
          <p className="text-muted small">Belum ada percakapan</p>
        ) : (
          sessions.map((session) => {
            let displayMessage = session.first_message;

            return (
              <div
                key={session.session_id}
                className={`history-item ${
                  session.session_id === activeSessionId ? "active" : ""
                }`}
                onClick={() => selectSession(session.session_id)}
              >
                {/* Klik kiri: pilih session */}
                <div
                  className="history-text"
                  onClick={() => selectSession(session.session_id)}
                >  
                  {displayMessage
                    ? displayMessage.slice(0, 28) + "..."
                    : "Percakapan Baru"}
              </div>
              {/* Tombol titik tiga */}
              <div
                className="history-menu-btn"
                onClick={(e) =>{
                  e.stopPropagation();
                  setOpenMenu(openMenu === session.session_id ? null : session.session_id)
                }}
              >
                ⋮
              </div>
              {/* Menu dropdown */}
              {openMenu === session.session_id && (
                <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.session_id);
                      setOpenMenu(null);
                    }}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
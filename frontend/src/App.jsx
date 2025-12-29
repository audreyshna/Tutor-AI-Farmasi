import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Header from "./components/Header.jsx";
import NavigationTabs from "./components/NavigationTabs.jsx";
import Footer from "./components/Footer.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import UjiKandunganPage from "./pages/SampleTestPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DosenPage from "./pages/DosenPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { ChatProvider } from "./context/ChatContext";

export default function App() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  
  // Saat app pertama kali jalan, ambil user dari localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    const userWithId = { ...user, user_id: user.id ?? user.user_id };
    setCurrentUser(userWithId);
    localStorage.setItem("user", JSON.stringify(userWithId));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  // Jika belum login, tampilkan halaman login/register
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Jika role = dosen atau admin, arahkan ke halaman upload materi
  if (currentUser.role === "dosen" || currentUser.role === "admin") {
    return (
      <div className="app-bg min-vh-100 d-flex flex-column">
        <Header />
        <main className="container pt-4 pb-2">
          <DosenPage />
        </main>
        <div className="text-center mb-3">
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ChatProvider user={currentUser}>
      <div className="app-bg min-vh-100 d-flex flex-column">
        <Header />
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="container flex-grow-1 mb-5">
          {activeTab === "chatbot" && <ChatbotPage user={currentUser} />}
          {activeTab === "uji" && <UjiKandunganPage />}
          {activeTab === "history" && <HistoryPage user={currentUser} />}
        </main>
        {/* Logout hanya tampil pada halaman home (chatbot) */}
        {activeTab === "chatbot" && (
          <div className="text-center mb-3">
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
               Logout
            </button>
          </div>
        )}
        <Footer />
      </div>
    </ChatProvider>
  );
}
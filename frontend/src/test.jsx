import React, { useState } from "react";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./components/Header.jsx";
import NavigationTabs from "./components/NavigationTabs.jsx";
import Footer from "./components/Footer.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import UjiKandunganPage from "./pages/SampleTestPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DosenPage from "./pages/DosenPage.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const handleLogin = (selectedRole) => {
    localStorage.setItem("role", selectedRole);
    setRole(selectedRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    setRole(null);
  };

  // Jika belum login, tampilkan halaman login
  if (!role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Jika role = dosen → tampil halaman upload materi
  if (role === "dosen") {
    return (
      <div className="app-bg min-vh-100 d-flex flex-column">
        <Header />
        <main className="container flex-grow-1 my-5">
          <DosenPage />
        </main>
        <div className="text-center mb-3">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm"
          >
            Logout
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Jika role = mahasiswa tampil halaman dengan tabs (Chatbot, Uji, History)
  return (
    <div className="app-bg min-vh-100 d-flex flex-column">
      <Header />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container flex-grow-1 mb-5">
        {activeTab === "chatbot" && <ChatbotPage />}
        {activeTab === "uji" && <UjiKandunganPage />}
        {activeTab === "history" && <HistoryPage />}
      </main>

      <div className="text-center mb-3">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm"
        >
          Logout
        </button>
      </div>

      <Footer />
    </div>
  );
}
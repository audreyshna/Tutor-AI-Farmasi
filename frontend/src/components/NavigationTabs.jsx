import React from "react";

export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "chatbot", label: "Chatbot", icon: "bi-chat-dots" },
    { id: "uji", label: "Uji Kandungan", icon: "bi-flask" },
  ];

  return (
    <div className="d-flex justify-content-center my-4">
      <div className="tab-wrapper shadow-sm p-2 px-4 rounded-pill bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn btn fw-semibold px-4 py-2 rounded-pill d-flex align-items-center gap-2 ${
              activeTab === tab.id ? "active-tab" : "inactive-tab"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
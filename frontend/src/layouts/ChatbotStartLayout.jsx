// src/layouts/ChatbotStartLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ChatbotStartLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // User aus LocalStorage laden
  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.warn("Konnte gespeicherten User nicht lesen:", e);
    }
  }, []);

  const getInitials = (user) => {
    if (!user) return "ME";
    const f = user.firstName?.trim()?.charAt(0) || "";
    const l = user.lastName?.trim()?.charAt(0) || "";
    const initials = (f + l).toUpperCase();
    return initials || "ME";
  };

  const getFullName = (user) => {
    if (!user) return "Benutzer";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.join(" ") || "Benutzer";
  };

  return (
    <div
      className="w-screen h-screen flex"
      style={{
        backgroundImage:
          "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
      }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-[#E4ECD9] shadow-sm flex flex-col p-4 transition-all duration-300`}
      >
        {collapsed ? (
          /* Eingeklappte Sidebar */
          <div className="flex flex-col items-center justify-between h-full">
            {/* Oben: Logo + Menu */}
            <div className="flex flex-col items-center gap-4 mt-1">
              {/* Logo Kreis */}
              <div
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center
                           font-semibold text-sm shadow-md"
                title="UNIAGENT"
              >
                🎓
              </div>

              {/* Menu Button */}
              <button
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Sidebar öffnen"
              >
                <span className="material-symbols-outlined text-[24px]">
                  menu
                </span>
              </button>

              {/* Neuer Chat */}
              <button
                title="Neuer Chat"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
              >
                <span className="material-symbols-outlined text-[24px]">
                  add_2
                </span>
              </button>

              {/* Chats suchen */}
              <button
                title="Chats suchen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
              >
                <span className="material-symbols-outlined text-[24px]">
                  search
                </span>
              </button>
            </div>

            {/* Avatar */}
            <div className="mb-2">
              <div
                className="w-10 h-10 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-sm"
                title={getFullName(currentUser)}
              >
                {getInitials(currentUser)}
              </div>
            </div>
          </div>
        ) : (
          /* Ausgeklappte Sidebar */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                  🎓
                </div>
                <span className="text-xl font-semibold tracking-tight">
                  UNIAGENT
                </span>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                title="Sidebar einklappen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
              >
                <span className="material-symbols-outlined text-[22px]">
                  menu
                </span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 flex-1">
              {/* Neuer Chat */}
              <button className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">
                  add_2
                </span>
                Neuer Chat
              </button>

              {/* Chats suchen */}
              <button className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">
                  search
                </span>
                Chats suchen
              </button>

              {/* Deine Chats */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Deine Chats
                </h3>

                <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
                  {/* ⭐ Nur noch dieser Chat bleibt übrig */}
                  <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">
                      chat_bubble
                    </span>
                    Prüfung anmelden
                  </button>
                </div>
              </div>
            </nav>

            {/* User */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-lg">
                {getInitials(currentUser)}
              </div>
              <div className="text-gray-800 font-medium leading-tight">
                {getFullName(currentUser)}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

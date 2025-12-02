// src/layouts/ChatbotLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

export default function ChatbotLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-screen h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-[#E4ECD9] shadow-sm flex flex-col p-4 transition-all duration-300`}
      >
        {collapsed ? (
          /* Eingeklappte Sidebar */
          <div className="flex flex-col items-center justify-between h-full">
            {/* Oben: Menu + Icons */}
            <div className="flex flex-col items-center gap-4 mt-1">
              {/* Menu zum Aufklappen */}
              <button
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Sidebar öffnen"
              >
                <span className="material-symbols-outlined text-[24px]">
                  menu
                </span>
              </button>

              {/* Neuer Chat Icon */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Neuer Chat"
              >
                <span className="material-symbols-outlined text-[24px]">
                  add_2
                </span>
              </button>

              {/* Chats suchen Icon */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Chats suchen"
              >
                <span className="material-symbols-outlined text-[24px]">
                  search
                </span>
              </button>
            </div>

            {/* Unten: Avatar-Kreis */}
            <div className="mb-2">
              <div
                className="w-10 h-10 rounded-full bg-[#98C73C] text-black flex items-center justify-center
                           font-semibold text-sm"
                title="Lukas Eisner"
              >
                LE
              </div>
            </div>
          </div>
        ) : (
          /* Ausgeklappte Sidebar */
          <>
            {/* Logo / Header mit Menu rechts */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                UNIAGENT 🎓
              </h1>
              <button
                onClick={() => setCollapsed(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Sidebar einklappen"
              >
                <span className="material-symbols-outlined text-[22px]">
                  menu
                </span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 flex-1">
              {/* Neuer Chat */}
              <button
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
                title="Neuer Chat"
              >
                <span className="material-symbols-outlined text-[22px]">
                  add_2
                </span>
                Neuer Chat
              </button>

              {/* Chats suchen */}
              <button
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
                title="Chats suchen"
              >
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
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer"
                    title="Bewerbung Informatik"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chat_bubble
                    </span>
                    Bewerbung Informatik
                  </button>

                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer"
                    title="Prüfung anmelden"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chat_bubble
                    </span>
                    Prüfung anmelden
                  </button>

                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer"
                    title="Campus Card verloren"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chat_bubble
                    </span>
                    Campus Card verloren
                  </button>
                </div>
              </div>
            </nav>

            {/* User Section unten */}
            <div className="mt-6 flex items-center gap-3">
              {/* Avatar Kreis */}
              <div className="w-12 h-12 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-lg">
                LE
              </div>

              {/* User Name */}
              <div className="text-gray-800 font-medium leading-tight">
                Lukas Eisner
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

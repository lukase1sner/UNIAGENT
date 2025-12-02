// src/layouts/ChatbotLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function ChatbotLayout() {
  return (
    <div className="w-screen h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-72 bg-[#E4ECD9] shadow-sm flex flex-col p-4">

        {/* Logo / Header */}
        <h1 className="text-2xl font-bold mb-6 tracking-tight">UNIAGENT 🎓</h1>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 flex-1">

          {/* Neuer Chat */}
          <button className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">add_2</span>
            Neuer Chat
          </button>

          {/* Chats suchen */}
          <button className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">search</span>
            Chats suchen
          </button>

          {/* Deine Chats */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Deine Chats
            </h3>

            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">
                  chat_bubble
                </span>
                Bewerbung Informatik
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">
                  chat_bubble
                </span>
                Prüfung anmelden
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition cursor-pointer">
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

      </aside>

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

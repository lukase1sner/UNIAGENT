// src/layouts/ChatbotLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Plus, Search, MessageSquare } from "lucide-react";

export default function ChatbotLayout() {
  return (
    <div className="w-screen h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r shadow-sm flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-6 tracking-tight">UNIAGENT</h1>

        <nav className="flex flex-col gap-4">
          <button className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700 cursor-pointer">
            <Plus size={20} />
            Neuer Chat
          </button>

          <button className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700 cursor-pointer">
            <Search size={20} />
            Chats suchen
          </button>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Deine Chats
            </h3>

            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                <MessageSquare size={16} />
                Bewerbung Informatik
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                <MessageSquare size={16} />
                Prüfung anmelden
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition cursor-pointer">
                <MessageSquare size={16} />
                Campus Card verloren
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
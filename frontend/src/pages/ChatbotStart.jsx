// src/pages/ChatbotStart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatbotStart() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const isReadyToSend = input.trim().length > 0;

  const sendMessage = () => {
    if (!isReadyToSend) return;

    const trimmed = input.trim();

    // Navigation in den "normalen" Chat mit der ersten User-Nachricht
    navigate("/chat", {
      state: { initialUserMessage: trimmed },
    });
  };

  const categories = [
    "Studiengänge & Bewerbung",
    "Studienorganisation",
    "Internationales & Sprachen",
    "Karriere & Berufseinstieg",
    "Campus & Leben vor Ort",
    "Forschung & Kooperation",
    "Beratung & Unterstützung",
  ];

  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      {/* Begrüßung */}
      <div className="text-center mb-6">
        <p className="text-2xl sm:text-3xl font-semibold">
          <span className="text-[#98C73C]">Hallo Lukas</span>, womit kann ich dir helfen?
        </p>
      </div>

      {/* Eingabebox – Design wie in Chatbot.jsx, nur mittig und breiter */}
      <div className="w-full max-w-3xl">
        {/* Gradient Außenrahmen */}
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          {/* Weißer Innencontainer */}
          <div className="relative rounded-xl bg-white">
            {/* Upload Button links */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2
                         w-10 h-10 flex items-center justify-center
                         bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              <span className="material-symbols-outlined text-[22px]">
                upload_file
              </span>
            </button>

            {/* Input */}
            <input
              type="text"
              placeholder="UNIAGENT fragen"
              className="w-full px-4 py-3 pl-14 pr-14 rounded-xl focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && isReadyToSend && sendMessage()
              }
            />

            {/* Sende-Button rechts */}
            <button
              onClick={sendMessage}
              disabled={!isReadyToSend}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition " +
                (isReadyToSend
                  ? "bg-[#98C73C] text-white hover:bg-[#7da32f] cursor-pointer"
                  : "bg-[#cfe5a9] text-white cursor-default")
              }
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_upward_alt
              </span>
            </button>
          </div>
        </div>

        {/* Hinweistext unter der Box */}
        <p className="mt-2 text-xs text-center text-gray-500">
          UNIAGENT kann Fehler machen. Überprüfe wichtige Informationen.
        </p>
      </div>

      {/* Kategorien */}
      <div className="mt-6 w-full max-w-4xl flex flex-wrap justify-center gap-3 text-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200
                       text-gray-700 transition whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

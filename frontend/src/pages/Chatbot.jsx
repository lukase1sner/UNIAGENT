// src/pages/Chatbot.jsx
import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hallo! Wie kann ich dir heute helfen? " },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      {
        sender: "bot",
        text: "Danke für deine Nachricht! Bald verknüpfen wir hier die KI 🤖",
      },
    ]);

    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat-Verlauf */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-xl text-sm ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Eingabebereich */}
      <div className="p-4 border-t bg-white">
        <div className="relative">

          {/* Text Input */}
          <input
            type="text"
            placeholder="UNIAGENT fragen"
            className="w-full px-4 py-3 pr-14 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* Runder Sendebutton innerhalb der Chatbox (rechts) */}
          <button
            onClick={sendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                       bg-[#98C73C] text-white rounded-full hover:bg-[#7da32f] transition"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_upward_alt
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}

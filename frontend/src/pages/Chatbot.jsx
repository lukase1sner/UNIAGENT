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

  const isReadyToSend = input.trim().length > 0;

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
                  ? "bg-[#98C73C] text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Eingabebereich */}
      <div className="px-4 pb-4 pt-2">

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
      </div>
    </div>
  );
}

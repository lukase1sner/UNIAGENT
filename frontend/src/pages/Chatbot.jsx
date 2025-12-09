// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const location = useLocation();

  const isReadyToSend = input.trim().length > 0;

  // Guard, damit die Initialnachricht nur EINMAL gesendet wird
  const initialHandledRef = useRef(false);

  // Nachricht an Backend schicken + Bot-Antwort anhängen
  const sendMessageToBot = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    // User-Nachricht sofort im Chat anzeigen
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);

    try {
      const response = await fetch("http://localhost:8080/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // muss zu ChatRequest.java passen → Feldname: "message"
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      const botText =
        data && data.reply && data.reply.trim()
          ? data.reply
          : "Entschuldigung, ich konnte nicht helfen.";

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Antwort:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Es ist ein technischer Fehler aufgetreten. Bitte versuche es später erneut.",
        },
      ]);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const current = input;
    setInput("");
    sendMessageToBot(current);
  };

  // erste Frage aus ChatbotStart übernehmen und nur EINMAL an den Bot schicken
  useEffect(() => {
    const initial = location.state?.initialUserMessage;
    if (!initial || initialHandledRef.current) return;

    initialHandledRef.current = true;
    sendMessageToBot(initial);
  }, [location.state]);

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

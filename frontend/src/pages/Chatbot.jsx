// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  // Guard, damit die Initialnachricht nur EINMAL gesendet wird
  const initialHandledRef = useRef(false);

  // Session ID für n8n Memory - bleibt während der gesamten Chat-Session gleich
  const sessionIdRef = useRef("session-" + Date.now());

  // ========================================
  // WICHTIG: Hier deine n8n Webhook URL eintragen!
  // ========================================
  const N8N_WEBHOOK_URL =
    "https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat";

  // Hilfsfunktion: Bot-Text aus n8n Response extrahieren
  const extractBotText = (data) => {
    if (!data) return null;

    // direkter String
    if (typeof data === "string") return data;

    // Objekt: { output: "..."} oder { BotResponse: "..." }
    if (typeof data.output === "string") return data.output;
    if (typeof data.BotResponse === "string") return data.BotResponse;

    // Array: [{ output: "..." }] oder [{ BotResponse: "..." }]
    if (Array.isArray(data) && data[0]) {
      if (typeof data[0].output === "string") return data[0].output;
      if (typeof data[0].BotResponse === "string") return data[0].BotResponse;

      // n8n wrapper: [{ json: { ... } }]
      if (data[0].json) {
        if (typeof data[0].json.output === "string") return data[0].json.output;
        if (typeof data[0].json.BotResponse === "string")
          return data[0].json.BotResponse;
      }
    }

    // verschachtelt: { output: { output: "..." } }
    if (data.output && typeof data.output.output === "string") return data.output.output;

    return null;
  };

  // Nachricht an n8n Backend schicken + Bot-Antwort anhängen
  const sendMessageToBot = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    // User-Nachricht sofort im Chat anzeigen
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: trimmed, // n8n erwartet "chatInput"
          sessionId: sessionIdRef.current, // Für Memory/Kontext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // robust: erst text lesen, dann versuchen JSON zu parsen
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw; // falls text/plain zurückkommt
      }

      // Standard-Fallback
      let botText = "Entschuldigung, ich konnte nicht helfen.";

      const extracted = extractBotText(data);
      if (extracted) botText = extracted;

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Antwort:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Es ist ein technischer Fehler aufgetreten. Bitte versuche es später erneut.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl bg-gray-200 text-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
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
              type="button"
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
              disabled={isLoading}
            />

            {/* Sende-Button rechts */}
            <button
              onClick={sendMessage}
              disabled={!isReadyToSend}
              type="button"
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
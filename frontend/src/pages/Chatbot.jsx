// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { N8N_WEBHOOK_URL as ENV_N8N_WEBHOOK_URL } from "../config";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  const initialHandledRef = useRef(false);
  const sessionIdRef = useRef("session-" + Date.now());

  // Auto-Scroll ans Ende (macht UX deutlich “snappier”)
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Fallback, falls Vercel ENV nicht gesetzt ist
  const N8N_WEBHOOK_URL =
    ENV_N8N_WEBHOOK_URL ||
    "https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat";

  const extractBotText = (data) => {
    if (!data) return null;

    if (typeof data === "string") return data;

    if (typeof data.output === "string") return data.output;
    if (typeof data.BotResponse === "string") return data.BotResponse;

    if (Array.isArray(data) && data[0]) {
      if (typeof data[0].output === "string") return data[0].output;
      if (typeof data[0].BotResponse === "string") return data[0].BotResponse;

      if (data[0].json) {
        if (typeof data[0].json.output === "string") return data[0].json.output;
        if (typeof data[0].json.BotResponse === "string")
          return data[0].json.BotResponse;
      }
    }

    if (data.output && typeof data.output.output === "string")
      return data.output.output;

    return null;
  };

  const sendMessageToBot = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    // Wenn URL wirklich fehlt -> sofort sichtbar melden
    if (!N8N_WEBHOOK_URL || String(N8N_WEBHOOK_URL).trim() === "") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Konfigurationsfehler: N8N Webhook URL fehlt. Bitte setze in Vercel die ENV Variable VITE_N8N_WEBHOOK_URL und deploye neu.",
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: trimmed,
          sessionId: sessionIdRef.current,
        }),
      });

      if (response.status === 405) {
        throw new Error(
          "HTTP 405 (Method Not Allowed). Du triffst wahrscheinlich nicht den richtigen n8n Webhook oder der Webhook ist nicht auf POST eingestellt."
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      let botText = "Entschuldigung, ich konnte nicht helfen.";
      const extracted = extractBotText(data);
      if (extracted) botText = extracted;

      // mini UX-delay, aber nicht “fake-streaming”
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      }, 80);
    } catch (error) {
      console.error("Fehler beim Abrufen der Antwort:", error);

      const msg =
        typeof error?.message === "string" && error.message.includes("405")
          ? "Fehler 405: Dein n8n Endpoint akzeptiert kein POST. Prüfe: VITE_N8N_WEBHOOK_URL in Vercel + Webhook Node Method=POST."
          : "Es ist ein technischer Fehler aufgetreten. Bitte versuche es später erneut.";

      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
      }, 80);
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

  useEffect(() => {
    const initial = location.state?.initialUserMessage;
    if (!initial || initialHandledRef.current) return;

    initialHandledRef.current = true;
    sendMessageToBot(initial);
  }, [location.state]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
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

        {/* Loading Indicator (ruhig & smooth) */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl bg-gray-200 text-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms", animationDuration: "1.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms", animationDuration: "1.1s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                upload_file
              </span>
            </button>

            <input
              type="text"
              placeholder="UNIAGENT fragen"
              className="w-full px-4 py-3 pl-14 pr-14 rounded-xl focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isReadyToSend && sendMessage()}
              disabled={isLoading}
            />

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
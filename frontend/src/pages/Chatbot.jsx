// src/pages/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { N8N_WEBHOOK_URL, API_BASE_URL } from "../config";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  const initialHandledRef = useRef(false);
  const sessionIdRef = useRef("session-" + Date.now());
  const chatIdRef = useRef(null);

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ---------------------------------------------
     User aus LocalStorage
  --------------------------------------------- */
  const getUser = () => {
    try {
      const raw = localStorage.getItem("uniagentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  /* ---------------------------------------------
     Chat erstellen (einmalig)
  --------------------------------------------- */
  const createChatIfNeeded = async (firstMessage) => {
    if (chatIdRef.current) return chatIdRef.current;

    const user = getUser();
    if (!user) return null;

    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: firstMessage.slice(0, 60),
        userId: user.id,
      }),
    });

    const data = await res.json();
    chatIdRef.current = data.id;
    return data.id;
  };

  /* ---------------------------------------------
     Nachricht im Backend speichern
  --------------------------------------------- */
  const saveMessage = async (chatId, sender, text) => {
    if (!chatId) return;

    await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, text }),
    });
  };

  /* ---------------------------------------------
     Bot-Text extrahieren (n8n)
  --------------------------------------------- */
  const extractBotText = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (typeof data.output === "string") return data.output;
    if (Array.isArray(data) && data[0]?.json?.output)
      return data[0].json.output;
    return null;
  };

  /* ---------------------------------------------
     Nachricht senden
  --------------------------------------------- */
  const sendMessageToBot = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    const chatId = await createChatIfNeeded(trimmed);
    await saveMessage(chatId, "user", trimmed);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: trimmed,
          sessionId: sessionIdRef.current,
        }),
      });

      const raw = await res.text();
      const data = (() => {
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      })();

      const botText =
        extractBotText(data) ||
        "Entschuldigung, ich konnte nicht helfen.";

      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      }, 60);

      await saveMessage(chatId, "bot", botText);
    } catch (e) {
      const msg = "Technischer Fehler. Bitte später erneut versuchen.";
      setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
      await saveMessage(chatId, "bot", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!isReadyToSend) return;
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

  /* ---------------------------------------------
     UI
  --------------------------------------------- */
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-3 rounded-xl max-w-xl text-sm ${
              m.sender === "user" ? "bg-[#98C73C] text-white" : "bg-gray-200 text-gray-800"
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl bg-gray-200">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDuration: "1.2s" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "200ms", animationDuration: "1.2s" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "400ms", animationDuration: "1.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            <input
              type="text"
              placeholder="UNIAGENT fragen"
              className="w-full px-4 py-3 pr-14 rounded-xl focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!isReadyToSend}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${
                isReadyToSend ? "bg-[#98C73C] hover:bg-[#7da32f]" : "bg-[#cfe5a9]"
              } text-white`}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
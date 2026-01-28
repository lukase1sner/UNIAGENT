// src/pages/Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  N8N_WEBHOOK_URL as ENV_N8N_WEBHOOK_URL,
  API_BASE_URL as ENV_API_BASE_URL,
} from "../config";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  const initialHandledRef = useRef(false);
  const sessionIdRef = useRef("session-" + Date.now());
  const chatIdRef = useRef(null);
  const bottomRef = useRef(null);

  // ----------------------------------
  // URLs
  // ----------------------------------
  const N8N_URL =
    (ENV_N8N_WEBHOOK_URL && String(ENV_N8N_WEBHOOK_URL).trim()) ||
    "https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat";

  const API_BASE_URL =
    (ENV_API_BASE_URL && String(ENV_API_BASE_URL).trim()) || "";

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  // ----------------------------------
  // Auto-Scroll
  // ----------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ----------------------------------
  // LocalStorage
  // ----------------------------------
  const getUser = () => {
    try {
      const raw = localStorage.getItem("uniagentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => {
    const user = getUser();
    return user?.token || null;
  };

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ----------------------------------
  // Bot-Text extrahieren
  // ----------------------------------
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

    return null;
  };

  // ----------------------------------
  // Messages laden
  // ----------------------------------
  const loadMessages = async (chatId) => {
    const token = getToken();
    if (!token || !API_BASE_URL || !chatId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
        method: "GET",
        headers: { ...authHeaders() },
      });

      if (!res.ok) throw new Error("Messages laden fehlgeschlagen");

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
        ? data.messages
        : [];

      const normalized = list
        .map((m) => ({
          sender:
            (m.sender || m.role || "").toLowerCase() === "bot"
              ? "bot"
              : "user",
          text: m.content ?? m.text ?? "",
          createdAt: m.createdAt || m.created_at || null,
        }))
        .filter((m) => m.text.trim().length > 0);

      normalized.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(normalized);
    } catch (e) {
      console.error(e);
      setMessages([]);
    }
  };

  // ----------------------------------
  // Chat-Wechsel
  // ----------------------------------
  useEffect(() => {
    const cid = location.state?.chatId || null;
    if (cid) {
      chatIdRef.current = cid;
      initialHandledRef.current = true;
      setMessages([]);
      loadMessages(cid);
    }
  }, [location.state?.chatId]); // eslint-disable-line

  // ----------------------------------
  // Chat erstellen
  // ----------------------------------
  const createChatIfNeeded = async (titleHint) => {
    if (chatIdRef.current) return chatIdRef.current;

    const token = getToken();
    if (!token) throw new Error("Token fehlt");

    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ title: titleHint.slice(0, 60) }),
    });

    if (!res.ok) throw new Error("Chat erstellen fehlgeschlagen");

    const data = await res.json();
    const id = data.id || data.chatId;

    chatIdRef.current = id;
    window.dispatchEvent(new Event("uniagent:chatsChanged"));
    return id;
  };

  // ----------------------------------
  // Message speichern
  // ----------------------------------
  const saveMessage = async (chatId, sender, content) => {
    if (!chatId || !API_BASE_URL) return;
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ sender, content }),
    });

    window.dispatchEvent(new Event("uniagent:chatsChanged"));
  };

  // ----------------------------------
  // Nachricht senden
  // ----------------------------------
  const sendMessageToBot = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    let chatId = null;

    try {
      chatId = await createChatIfNeeded(trimmed);
      await saveMessage(chatId, "user", trimmed);

      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: trimmed,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) throw new Error("n8n Fehler");

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      const botText =
        extractBotText(data) ||
        "Entschuldigung, ich konnte nicht helfen.";

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      await saveMessage(chatId, "bot", botText);
    } catch (e) {
      const msg = "Technischer Fehler beim Bot. Bitte später erneut versuchen.";
      setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
      if (chatId) await saveMessage(chatId, "bot", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!isReadyToSend) return;
    const value = input;
    setInput("");
    sendMessageToBot(value);
  };

  // initial message aus ChatbotStart
  useEffect(() => {
    const initial = location.state?.initialUserMessage;
    if (!initial || initialHandledRef.current) return;
    initialHandledRef.current = true;
    sendMessageToBot(initial);
  }, [location.state?.initialUserMessage]); // eslint-disable-line

  // ----------------------------------
  // UI
  // ----------------------------------
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl bg-gray-200">
              <div className="flex items-center gap-2">
                {[0, 200, 400].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms`, animationDuration: "1.2s" }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 🔥 Chatbox – 1:1 wie ChatbotStart */}
      <div className="px-4 pb-4">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!isReadyToSend}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full transition " +
                (isReadyToSend
                  ? "bg-[#98C73C] text-white hover:bg-[#7da32f]"
                  : "bg-[#cfe5a9] text-white")
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
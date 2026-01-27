// src/pages/Chatbot.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { N8N_WEBHOOK_URL, API_BASE_URL } from "../config";

export default function Chatbot() {
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  const initialHandledRef = useRef(false);
  const sessionIdRef = useRef("session-" + Date.now());
  const chatIdRef = useRef(null);

  // Auto-Scroll
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ---------------------------------------------
  // LocalStorage helpers
  // ---------------------------------------------
  const getUser = () => {
    try {
      const raw = localStorage.getItem("uniagentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getAccessToken = () => {
    const u = getUser();
    return (
      u?.token || // du speicherst "token"
      u?.access_token || // falls du mal access_token speicherst
      null
    );
  };

  const authHeaders = useMemo(() => {
    const token = getAccessToken();
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" };
  }, []);

  // ---------------------------------------------
  // Robust: Bot-Text aus n8n Response extrahieren
  // ---------------------------------------------
  const extractBotText = (data) => {
    if (!data) return null;

    // direkter String
    if (typeof data === "string") return data;

    // Objekt
    if (typeof data.output === "string") return data.output;
    if (typeof data.BotResponse === "string") return data.BotResponse;
    if (typeof data.text === "string") return data.text;

    // verschachtelt
    if (data.output && typeof data.output.output === "string") return data.output.output;

    // Array-Varianten (n8n)
    if (Array.isArray(data) && data[0]) {
      if (typeof data[0].output === "string") return data[0].output;
      if (typeof data[0].BotResponse === "string") return data[0].BotResponse;

      if (data[0].json) {
        if (typeof data[0].json.output === "string") return data[0].json.output;
        if (typeof data[0].json.BotResponse === "string") return data[0].json.BotResponse;
        if (typeof data[0].json.text === "string") return data[0].json.text;
      }
    }

    return null;
  };

  // ---------------------------------------------
  // Backend: Chat erstellen (einmalig)
  // Erwartet: POST /api/chats (Authorization Bearer)
  // Body: { title? }
  // -> { id } oder { chatId }
  // ---------------------------------------------
  const createChatIfNeeded = async (firstMessage) => {
    // 1) wenn über Navigation schon da
    const fromState = location.state?.chatId;
    if (fromState && !chatIdRef.current) chatIdRef.current = fromState;

    if (chatIdRef.current) return chatIdRef.current;

    const token = getAccessToken();
    if (!token) {
      console.warn("Kein Access-Token in LocalStorage (uniagentUser.token).");
      return null;
    }

    const title = (firstMessage || "Neuer Chat").trim().slice(0, 60);

    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ title }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`Chat create failed: HTTP ${res.status} - ${raw}`);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }

    const id = data.id || data.chatId;
    if (!id) throw new Error("Chat create failed: response has no id/chatId");

    chatIdRef.current = id;
    return id;
  };

  // ---------------------------------------------
  // Backend: Message speichern
  // Erwartet: POST /api/chats/{chatId}/messages (Authorization Bearer)
  // Body: { sender: "user"|"bot", content: "..." }
  // ---------------------------------------------
  const saveMessage = async (chatId, sender, content) => {
    if (!chatId) return;

    const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ sender, content }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      console.warn("saveMessage failed:", res.status, raw);
    }
  };

  // ---------------------------------------------
  // Backend: Messages laden (wenn chatId da)
  // Erwartet: GET /api/chats/{chatId}/messages (Authorization Bearer)
  // -> [{sender, content}]
  // ---------------------------------------------
  const loadMessages = async (chatId) => {
    if (!chatId) return;

    const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: "GET",
      headers: authHeaders,
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      console.warn("loadMessages failed:", res.status, raw);
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) return;

    setMessages(
      data
        .filter((m) => m && m.sender && (m.content ?? m.text))
        .map((m) => ({
          sender: m.sender,
          text: (m.content ?? m.text ?? "").toString(),
        }))
    );
  };

  // beim Eintritt mit chatId: messages laden
  useEffect(() => {
    const cid = location.state?.chatId;
    if (!cid) return;
    chatIdRef.current = cid;
    loadMessages(cid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.chatId]);

  // ---------------------------------------------
  // n8n Anfrage + UI + speichern
  // ---------------------------------------------
  const sendMessageToBot = async (userText) => {
    const trimmed = (userText || "").trim();
    if (!trimmed) return;

    // UI sofort
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    let chatId = null;

    try {
      chatId = await createChatIfNeeded(trimmed);
      await saveMessage(chatId, "user", trimmed);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Ich konnte den Chat im Backend nicht erstellen/speichern (Auth/Endpoint). Bitte prüfe Backend-URL & Token.",
        },
      ]);
      setIsLoading(false);
      return;
    }

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
      if (!res.ok) {
        throw new Error(`n8n HTTP ${res.status}: ${raw}`);
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      const botText = extractBotText(data) || "Entschuldigung, ich konnte nicht helfen.";

      // mini-delay, wirkt smooth (kein fake streaming)
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      }, 60);

      await saveMessage(chatId, "bot", botText);
    } catch (e) {
      console.error("n8n error:", e);
      const msg = "Technischer Fehler beim Bot. Bitte später erneut versuchen.";
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

  // initial message (vom Startscreen)
  useEffect(() => {
    const initial = location.state?.initialUserMessage;
    if (!initial || initialHandledRef.current) return;
    initialHandledRef.current = true;
    sendMessageToBot(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
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
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "220ms", animationDuration: "1.2s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "440ms", animationDuration: "1.2s" }}
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
            <input
              type="text"
              placeholder="UNIAGENT fragen"
              className="w-full px-4 py-3 pr-14 rounded-xl focus:outline-none"
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
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition " +
                (isReadyToSend
                  ? "bg-[#98C73C] text-white hover:bg-[#7da32f] cursor-pointer"
                  : "bg-[#cfe5a9] text-white cursor-default")
              }
              title="Senden"
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
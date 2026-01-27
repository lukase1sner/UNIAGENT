// src/pages/Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  N8N_WEBHOOK_URL as ENV_N8N_WEBHOOK_URL,
  API_BASE_URL as ENV_API_BASE_URL,
} from "../config";

export default function Chatbot() {
  const [messages, setMessages] = useState([]); // [{ sender: "user"|"bot", text }]
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  const initialHandledRef = useRef(false);
  const sessionIdRef = useRef("session-" + Date.now());
  const chatIdRef = useRef(null);
  const bottomRef = useRef(null);

  // -----------------------------
  // URLs (robust + fallback)
  // -----------------------------
  const N8N_URL =
    (ENV_N8N_WEBHOOK_URL && String(ENV_N8N_WEBHOOK_URL).trim()) ||
    "https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat";

  const API_BASE_URL =
    (ENV_API_BASE_URL && String(ENV_API_BASE_URL).trim()) || "";

  const isReadyToSend = input.trim().length > 0 && !isLoading;

  // -----------------------------
  // Auto scroll
  // -----------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // -----------------------------
  // LocalStorage helpers
  // -----------------------------
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

  // -----------------------------
  // n8n: Bot-Text extrahieren
  // -----------------------------
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

  // -----------------------------
  // Backend: Messages laden (WICHTIG!)
  // GET /api/chats/{chatId}/messages
  // -> [{ sender, content, createdAt ... }]
  // -----------------------------
  const loadMessages = async (chatId) => {
    const token = getToken();
    if (!token || !API_BASE_URL || !chatId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
        method: "GET",
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      const data = await res.json().catch(() => null);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
        ? data.messages
        : [];

      // Normalisieren -> dein UI erwartet { sender, text }
      const normalized = list
        .map((m) => ({
          sender: (m.sender || m.role || "").toLowerCase() === "bot" ? "bot" : "user",
          text: m.content ?? m.text ?? m.message ?? "",
          createdAt: m.createdAt || m.created_at || null,
        }))
        .filter((m) => String(m.text || "").trim().length > 0);

      // Optional sortieren nach Datum
      normalized.sort((a, b) => {
        const ad = new Date(a.createdAt || 0).getTime();
        const bd = new Date(b.createdAt || 0).getTime();
        return ad - bd;
      });

      setMessages(normalized);
    } catch (e) {
      console.error("Messages laden fehlgeschlagen:", e);
      // nicht komplett leeren, aber typischerweise willst du leeren:
      setMessages([]);
    }
  };

  // -----------------------------
  // Chat-Wechsel: chatId übernehmen + Messages laden
  // -----------------------------
  useEffect(() => {
    const cid = location.state?.chatId || null;

    // Wenn ein Chat gewählt wurde: ref setzen + UI reset + aus DB laden
    if (cid) {
      chatIdRef.current = cid;
      initialHandledRef.current = true; // initial message nicht nochmal schicken
      setIsLoading(false);
      setInput("");
      setMessages([]); // kurz leeren (optional)
      loadMessages(cid);
      return;
    }

    // Wenn kein cid übergeben wurde, lass es (z.B. Startseite /chat ohne state)
    // initialHandledRef NICHT pauschal resetten, sonst spammst du initialUserMessage.
  }, [location.state?.chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------
  // Backend: Chat erstellen (einmalig)
  // POST /api/chats  (Authorization: Bearer <token>)
  // Body: { title? }
  // -> { id } oder { chatId }
  // -----------------------------
  const createChatIfNeeded = async (titleHint) => {
    // 1) schon vorhanden
    if (chatIdRef.current) return chatIdRef.current;

    // 2) über navigate state übergeben
    const passedChatId = location.state?.chatId;
    if (passedChatId) {
      chatIdRef.current = passedChatId;
      return passedChatId;
    }

    const token = getToken();
    if (!token) throw new Error("Kein Token gefunden. Bitte neu einloggen.");
    if (!API_BASE_URL) throw new Error("API_BASE_URL fehlt (VITE_API_BASE_URL).");

    const res = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        title: (titleHint || "Neuer Chat").slice(0, 60),
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Chat erstellen fehlgeschlagen: HTTP ${res.status} ${t}`);
    }

    const data = await res.json().catch(() => ({}));
    const id = data.id || data.chatId;
    if (!id) throw new Error("Backend hat keine Chat-ID zurückgegeben.");

    chatIdRef.current = id;

    // Sidebar/Layouts informieren
    window.dispatchEvent(new Event("uniagent:chatsChanged"));

    return id;
  };

  // -----------------------------
  // Backend: Nachricht speichern
  // POST /api/chats/{chatId}/messages
  // Body: { sender, content }
  // -----------------------------
  const saveMessage = async (chatId, sender, content) => {
    if (!chatId || !API_BASE_URL) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ sender, content }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("saveMessage failed:", res.status, t);
      } else {
        // updatedAt/titel etc.
        window.dispatchEvent(new Event("uniagent:chatsChanged"));
      }
    } catch (e) {
      console.warn("saveMessage error:", e);
    }
  };

  // -----------------------------
  // Nachricht senden
  // -----------------------------
  const sendMessageToBot = async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    let chatIdForThisMessage = null;

    try {
      if (!N8N_URL || String(N8N_URL).trim() === "") {
        throw new Error("N8N_WEBHOOK_URL fehlt (VITE_N8N_WEBHOOK_URL).");
      }

      // Chat anlegen (wenn nötig) + User msg speichern
      chatIdForThisMessage = await createChatIfNeeded(trimmed);
      await saveMessage(chatIdForThisMessage, "user", trimmed);

      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: trimmed,
          sessionId: sessionIdRef.current,
        }),
      });

      if (res.status === 405) {
        const raw405 = await res.text().catch(() => "");
        console.error("n8n 405 raw:", raw405);
        throw new Error("n8n HTTP 405 (Method Not Allowed)");
      }

      if (!res.ok) {
        const rawErr = await res.text().catch(() => "");
        console.error("n8n error raw:", rawErr);
        throw new Error(`n8n HTTP ${res.status}`);
      }

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      const botText =
        extractBotText(data) || "Entschuldigung, ich konnte nicht helfen.";

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      await saveMessage(chatIdForThisMessage, "bot", botText);
    } catch (e) {
      console.error("sendMessageToBot error:", e);

      const msg =
        String(e?.message || "").includes("405")
          ? "Technischer Fehler: n8n akzeptiert gerade kein POST (HTTP 405). Prüfe die Webhook-URL und dass der Webhook POST ist."
          : "Technischer Fehler beim Bot. Bitte später erneut versuchen.";

      setMessages((prev) => [...prev, { sender: "bot", text: msg }]);

      const cid = chatIdForThisMessage || chatIdRef.current;
      if (cid) await saveMessage(cid, "bot", msg);
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

  // initial message (von ChatbotStart)
  useEffect(() => {
    const initial = location.state?.initialUserMessage;
    if (!initial || initialHandledRef.current) return;

    initialHandledRef.current = true;
    sendMessageToBot(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.initialUserMessage]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex flex-col h-full">
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
            <div className="px-4 py-3 rounded-xl bg-gray-200 text-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms", animationDuration: "1.2s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms", animationDuration: "1.2s" }}
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
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white transition " +
                (isReadyToSend
                  ? "bg-[#98C73C] hover:bg-[#7da32f]"
                  : "bg-[#cfe5a9]")
              }
              title="Senden"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_upward_alt
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
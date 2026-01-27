// src/pages/ChatbotStart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ChatbotStart() {
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const isReadyToSend = input.trim().length > 0 && !isCreating;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.warn("Konnte gespeicherten User nicht lesen:", e);
    }
  }, []);

  const token = useMemo(() => {
    if (!currentUser) return null;
    return currentUser.token || currentUser.access_token || null;
  }, [currentUser]);

  const apiBase = useMemo(() => {
    // Wenn API_BASE_URL nicht gesetzt ist, nimm relative Calls -> /api/...
    const v = (API_BASE_URL || "").trim();
    return v ? v.replace(/\/$/, "") : "";
  }, []);

  const getFirstName = (user) => {
    if (!user) return "Benutzer";
    return user.firstName || user.first_name || "Benutzer";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isCreating) return;

    if (!token) {
      alert("Login-Token fehlt. Bitte einmal neu einloggen.");
      return;
    }

    setIsCreating(true);
    setInput("");

    const url = `${apiBase}/api`;
    const endpoint = apiBase ? `${url}/chats` : `/api/chats`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstMessage: trimmed,
        }),
      });

      if (!res.ok) {
        // versuche Server-Fehlertext zu lesen (super hilfreich beim Debug)
        let serverText = "";
        try {
          serverText = await res.text();
        } catch {}
        throw new Error(`HTTP ${res.status}${serverText ? ` – ${serverText}` : ""}`);
      }

      const data = await res.json();

      // Erwartet: { id: "<chatId>" }
      navigate("/chat", {
        state: {
          chatId: data.id,
          initialUserMessage: trimmed,
        },
      });
    } catch (err) {
      console.error("Chat erstellen fehlgeschlagen:", err);
      alert(
        "Chat konnte nicht erstellt werden.\n\n" +
          (err?.message || "Bitte versuche es erneut.")
      );
      // Input zurück, damit der Nutzer nicht alles verliert
      setInput(trimmed);
    } finally {
      setIsCreating(false);
    }
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
      <div className="text-center mb-6">
        <p className="text-2xl sm:text-3xl font-semibold">
          <span className="text-[#98C73C]">Hallo {getFirstName(currentUser)}</span>, womit kann ich dir helfen?
        </p>

        {!token && (
          <p className="mt-2 text-xs text-red-600">
            Hinweis: Login-Token fehlt im LocalStorage (uniagentUser). Bitte neu einloggen.
          </p>
        )}
      </div>

      <div className="w-full max-w-3xl">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
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
              disabled={isCreating}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!isReadyToSend || !token}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition " +
                (isReadyToSend && token
                  ? "bg-[#98C73C] text-white hover:bg-[#7da32f] cursor-pointer"
                  : "bg-[#cfe5a9] text-white cursor-default")
              }
              title={!token ? "Bitte neu einloggen (Token fehlt)" : "Senden"}
            >
              <span className="material-symbols-outlined text-[22px]">arrow_upward_alt</span>
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-center text-gray-500">
          UNIAGENT kann Fehler machen. Überprüfe wichtige Informationen.
        </p>
      </div>

      <div className="mt-6 w-full max-w-4xl flex flex-wrap justify-center gap-3 text-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setInput(cat)}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200 text-gray-700 transition whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
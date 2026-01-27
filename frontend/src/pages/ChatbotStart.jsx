// src/pages/ChatbotStart.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ChatbotStart() {
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // ✅ robust: welche ID haben wir wirklich?
  const userId = useMemo(() => {
    if (!currentUser) return null;
    return (
      currentUser.id || // falls du deine DB-user-id speicherst
      currentUser.userId ||
      currentUser.auth_user_id || // häufig bei Supabase
      currentUser.authUserId ||
      null
    );
  }, [currentUser]);

  const isReadyToSend = input.trim().length > 0 && !isCreating;

  // --------------------------------------------------
  // User aus LocalStorage laden
  // --------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.warn("Konnte gespeicherten User nicht lesen:", e);
    }
  }, []);

  const getFirstName = (user) => {
    if (!user) return "Benutzer";
    return user.firstName || user.first_name || "Benutzer";
  };

  // --------------------------------------------------
  // Neuer Chat + erste Nachricht
  // POST /api/chats  Body: { userId, firstMessage }
  // -> { id }
  // --------------------------------------------------
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isCreating) return;

    // ✅ wichtig: wenn userId fehlt, sichtbar melden (sonst wirkt's „kaputt“)
    if (!userId) {
      console.warn("Kein userId gefunden in uniagentUser:", currentUser);
      alert(
        "Du bist gerade nicht korrekt eingeloggt (userId fehlt). Bitte einmal neu einloggen."
      );
      return;
    }

    setInput("");
    setIsCreating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firstMessage: trimmed,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      navigate("/chat", {
        state: {
          chatId: data.id,
          initialUserMessage: trimmed,
        },
      });
    } catch (err) {
      console.error("Chat erstellen fehlgeschlagen:", err);
      alert("Chat konnte nicht erstellt werden. Bitte versuche es erneut.");
      // falls es fehlschlägt, Input zurückgeben
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
      {/* Begrüßung */}
      <div className="text-center mb-6">
        <p className="text-2xl sm:text-3xl font-semibold">
          <span className="text-[#98C73C]">
            Hallo {getFirstName(currentUser)}
          </span>
          , womit kann ich dir helfen?
        </p>

        {/* optional mini debug hint (kannst du später entfernen) */}
        {!userId && (
          <p className="mt-2 text-xs text-red-600">
            Hinweis: userId fehlt im LocalStorage (uniagentUser). Deshalb kann
            nichts gesendet werden.
          </p>
        )}
      </div>

      {/* Eingabebox */}
      <div className="w-full max-w-3xl">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            {/* Upload Button (noch ohne Funktion) */}
            <button
              type="button"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isCreating}
            />

            {/* Senden */}
            <button
              type="button"
              onClick={sendMessage}
              disabled={!isReadyToSend || !userId}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 " +
                "w-10 h-10 flex items-center justify-center rounded-full transition " +
                (isReadyToSend && userId
                  ? "bg-[#98C73C] text-white hover:bg-[#7da32f] cursor-pointer"
                  : "bg-[#cfe5a9] text-white cursor-default")
              }
              title={!userId ? "Bitte neu einloggen (userId fehlt)" : "Senden"}
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_upward_alt
              </span>
            </button>
          </div>
        </div>

        {/* Hinweis */}
        <p className="mt-2 text-xs text-center text-gray-500">
          UNIAGENT kann Fehler machen. Überprüfe wichtige Informationen.
        </p>
      </div>

      {/* Kategorien */}
      <div className="mt-6 w-full max-w-4xl flex flex-wrap justify-center gap-3 text-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setInput(cat)}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200
                       text-gray-700 transition whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
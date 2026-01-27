// src/pages/ChatbotStart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ChatbotStart() {
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const isReadyToSend = input.trim().length > 0 && !isCreating;

  // --------------------------------------------------
  // User aus LocalStorage laden
  // --------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.warn("Konnte gespeicherten User nicht lesen:", e);
    }
  }, []);

  const getFirstName = (user) =>
    user?.firstName || user?.first_name || "Benutzer";

  // --------------------------------------------------
  // Neuer Chat + erste Nachricht
  // Backend liest User aus JWT!
  // --------------------------------------------------
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isCreating) return;

    if (!currentUser?.token) {
      alert("Login abgelaufen. Bitte neu einloggen.");
      return;
    }

    setInput("");
    setIsCreating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
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
      alert("Chat konnte nicht erstellt werden.");
      setInput(trimmed);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <div className="text-center mb-6">
        <p className="text-2xl sm:text-3xl font-semibold">
          <span className="text-[#98C73C]">
            Hallo {getFirstName(currentUser)}
          </span>
          , womit kann ich dir helfen?
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <div className="relative p-[4px] rounded-2xl bg-gradient-to-b from-[#E4ECD9] to-[#98C73C90]">
          <div className="relative rounded-xl bg-white">
            <input
              type="text"
              placeholder="UNIAGENT fragen"
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
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
              onClick={sendMessage}
              disabled={!isReadyToSend}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full transition " +
                (isReadyToSend
                  ? "bg-[#98C73C] text-white"
                  : "bg-[#cfe5a9] text-white")
              }
            >
              <span className="material-symbols-outlined">
                arrow_upward_alt
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
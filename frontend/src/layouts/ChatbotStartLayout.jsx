// src/layouts/ChatbotStartLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ChatbotStartLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Chats / UI
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);

  // Search Modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Delete Menu
  const [menuChatId, setMenuChatId] = useState(null);

  const navigate = useNavigate();

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

  const getInitials = (user) => {
    if (!user) return "ME";
    const f = user.firstName?.trim()?.charAt(0) || "";
    const l = user.lastName?.trim()?.charAt(0) || "";
    const initials = (f + l).toUpperCase();
    return initials || "ME";
  };

  const getFullName = (user) => {
    if (!user) return "Benutzer";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.join(" ") || "Benutzer";
  };

  // --------------------------------------------------
  // Chats laden
  // Erwartet Backend:
  // GET /api/chats?userId=...
  // -> [{ id, title, updatedAt }]
  // --------------------------------------------------
  const loadChats = async (userId) => {
    if (!userId) return;
    setLoadingChats(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Chats laden fehlgeschlagen:", e);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    loadChats(currentUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // --------------------------------------------------
  // Neuer Chat (Start-Seite: führt zu ChatbotStart, optional)
  // Erwartet Backend:
  // POST /api/chats
  // Body: { userId }
  // -> { id }
  // --------------------------------------------------
  const handleNewChat = async () => {
    if (!currentUser?.id) return;

    // Auf Startseite soll "Neuer Chat" einfach Eingabe ermöglichen.
    // Wir erstellen aber schon einen Chat-Container, damit Sidebar/DB direkt passt.
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Chat öffnen (ohne Initialmessage)
      setActiveChatId(data.id);
      navigate("/chat", { state: { chatId: data.id } });

      // Liste neu ziehen
      loadChats(currentUser.id);
    } catch (e) {
      console.error("Neuer Chat fehlgeschlagen:", e);
      alert("Neuer Chat konnte nicht erstellt werden.");
    }
  };

  // --------------------------------------------------
  // Chat öffnen
  // --------------------------------------------------
  const openChat = (chatId) => {
    if (!chatId) return;
    setActiveChatId(chatId);
    setMenuChatId(null);
    navigate("/chat", { state: { chatId } });
  };

  // --------------------------------------------------
  // Chat löschen
  // Erwartet Backend:
  // DELETE /api/chats/{chatId}
  // --------------------------------------------------
  const deleteChat = async (chatId) => {
    if (!chatId || !currentUser?.id) return;

    const ok = window.confirm("Diesen Chat wirklich löschen?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setMenuChatId(null);

      // wenn gerade aktiv -> zurück zur Startseite
      if (activeChatId === chatId) {
        setActiveChatId(null);
        navigate("/chat-start");
      }

      loadChats(currentUser.id);
    } catch (e) {
      console.error("Chat löschen fehlgeschlagen:", e);
      alert("Chat konnte nicht gelöscht werden.");
    }
  };

  // --------------------------------------------------
  // Search Modal
  // Erwartet Backend:
  // GET /api/chats/search?userId=...&q=...
  // -> [{ id, title, snippet }]
  // --------------------------------------------------
  const openSearch = () => {
    setSearchOpen(true);
    setSearchValue("");
    setSearchResults([]);
    setMenuChatId(null);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (!searchOpen) return;

    const q = searchValue.trim();
    if (!q || !currentUser?.id) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/chats/search?userId=${currentUser.id}&q=${encodeURIComponent(
            q
          )}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Chat-Suche fehlgeschlagen:", e);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 220); // kleine Debounce

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, searchOpen, currentUser?.id]);

  // Outside click für 3-Punkte Menü
  useEffect(() => {
    const onDown = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;

      // wenn man auf den Menü-Button klickt -> nicht schließen
      if (el.closest("[data-chat-menu-btn='1']")) return;
      // wenn man im Menü klickt -> nicht schließen
      if (el.closest("[data-chat-menu='1']")) return;

      setMenuChatId(null);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div
      className="w-screen h-screen flex"
      style={{
        backgroundImage:
          "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
      }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-[#E4ECD9] shadow-sm flex flex-col p-4 transition-all duration-300`}
      >
        {collapsed ? (
          /* Eingeklappte Sidebar */
          <div className="flex flex-col items-center justify-between h-full">
            {/* Oben: Logo + Menu */}
            <div className="flex flex-col items-center gap-4 mt-1">
              {/* Logo Kreis */}
              <button
                type="button"
                onClick={() => navigate("/chat-start")}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center
                           font-semibold text-sm shadow-md cursor-pointer"
                title="UNIAGENT"
              >
                🎓
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                title="Sidebar öffnen"
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">
                  menu
                </span>
              </button>

              {/* Neuer Chat */}
              <button
                title="Neuer Chat"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                type="button"
                onClick={handleNewChat}
              >
                <span className="material-symbols-outlined text-[24px]">
                  add_2
                </span>
              </button>

              {/* Chats suchen */}
              <button
                title="Chats suchen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                type="button"
                onClick={openSearch}
              >
                <span className="material-symbols-outlined text-[24px]">
                  search
                </span>
              </button>
            </div>

            {/* Avatar */}
            <div className="mb-2">
              <div
                className="w-10 h-10 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-sm"
                title={getFullName(currentUser)}
              >
                {getInitials(currentUser)}
              </div>
            </div>
          </div>
        ) : (
          /* Ausgeklappte Sidebar */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate("/chat-start")}
                className="flex items-center gap-3 cursor-pointer select-none"
                title="Zur Startseite"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                  🎓
                </div>
                <span className="text-xl font-semibold tracking-tight">
                  UNIAGENT
                </span>
              </button>

              <button
                onClick={() => setCollapsed(true)}
                title="Sidebar einklappen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">
                  menu
                </span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 flex-1">
              {/* Neuer Chat */}
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  add_2
                </span>
                Neuer Chat
              </button>

              {/* Chats suchen */}
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  search
                </span>
                Chats suchen
              </button>

              {/* Deine Chats */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Deine Chats
                </h3>

                <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
                  {loadingChats && (
                    <div className="text-xs text-gray-600 px-2">
                      Lade Chats…
                    </div>
                  )}

                  {!loadingChats && chats.length === 0 && (
                    <div className="text-xs text-gray-600 px-2">
                      Noch keine Chats.
                    </div>
                  )}

                  {chats.map((c) => {
                    const isActive = c.id === activeChatId;

                    return (
                      <div
                        key={c.id}
                        className="relative group"
                        onMouseLeave={() => setMenuChatId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => openChat(c.id)}
                          className={
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition cursor-pointer " +
                            (isActive
                              ? "bg-white text-gray-900"
                              : "bg-white/80 hover:bg-white text-gray-700")
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chat_bubble
                          </span>

                          <span className="flex-1 text-left truncate">
                            {c.title || "Neuer Chat"}
                          </span>

                          {/* 3 Punkte: nur on hover sichtbar */}
                          <button
                            type="button"
                            data-chat-menu-btn="1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuChatId((prev) =>
                                prev === c.id ? null : c.id
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity
                                       w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
                            title="Optionen"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              more_horiz
                            </span>
                          </button>
                        </button>

                        {/* Dropdown Menu */}
                        {menuChatId === c.id && (
                          <div
                            data-chat-menu="1"
                            className="absolute right-2 top-10 z-50 w-44 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(c.id);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                              Chat löschen
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* User */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-lg">
                {getInitials(currentUser)}
              </div>
              <div className="text-gray-800 font-medium leading-tight">
                {getFullName(currentUser)}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="font-semibold text-gray-900">Chats suchen</div>
              <button
                type="button"
                onClick={closeSearch}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                title="Schließen"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            <div className="p-5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Titel oder Inhalt…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <div className="mt-4 max-h-[52vh] overflow-y-auto">
                {searchLoading && (
                  <div className="text-sm text-gray-500 py-3">
                    Suche läuft…
                  </div>
                )}

                {!searchLoading && searchValue.trim() && searchResults.length === 0 && (
                  <div className="text-sm text-gray-500 py-3">
                    Keine Ergebnisse.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        closeSearch();
                        openChat(r.id);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="font-semibold text-gray-900 truncate">
                        {r.title || "Chat"}
                      </div>
                      {r.snippet && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {r.snippet}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={closeSearch}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
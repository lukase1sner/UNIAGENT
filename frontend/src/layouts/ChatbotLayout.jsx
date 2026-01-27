// src/layouts/ChatbotLayout.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL as ENV_API_BASE_URL } from "../config";

export default function ChatbotLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Chats
  const [chats, setChats] = useState([]); // [{ id, title, createdAt, updatedAt }]
  const [loadingChats, setLoadingChats] = useState(false);

  // Search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 3-dots menu (pro Chat)
  const [menuOpenFor, setMenuOpenFor] = useState(null); // chatId | null
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = (ENV_API_BASE_URL && String(ENV_API_BASE_URL).trim()) || "";

  // ---------------------------------------------
  // User & Token
  // ---------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.warn("Konnte gespeicherten User nicht lesen:", e);
    }
  }, []);

  const getToken = () => {
    try {
      const raw = localStorage.getItem("uniagentUser");
      const u = raw ? JSON.parse(raw) : null;
      return u?.token || null;
    } catch {
      return null;
    }
  };

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getInitials = (user) => {
    if (!user) return "ME";
    const f =
      user.firstName?.trim()?.charAt(0) ||
      user.first_name?.trim()?.charAt(0) ||
      "";
    const l =
      user.lastName?.trim()?.charAt(0) ||
      user.last_name?.trim()?.charAt(0) ||
      "";
    const initials = (f + l).toUpperCase();
    return initials || "ME";
  };

  const getFullName = (user) => {
    if (!user) return "Benutzer";
    const first = user.firstName || user.first_name || "";
    const last = user.lastName || user.last_name || "";
    const parts = [first, last].filter(Boolean);
    return parts.join(" ") || "Benutzer";
  };

  // ---------------------------------------------
  // Aktiver Chat: aus navigation state + fallback via sessionStorage
  // (weil location.state nach Reload leer sein kann)
  // ---------------------------------------------
  const [activeChatId, setActiveChatId] = useState(() => {
    return sessionStorage.getItem("uniagentActiveChatId") || null;
  });

  useEffect(() => {
    const cid = location.state?.chatId;
    if (cid) {
      setActiveChatId(cid);
      sessionStorage.setItem("uniagentActiveChatId", cid);
    }
  }, [location.state?.chatId]);

  // ---------------------------------------------
  // Chats laden (TOKEN-BASIERT)
  // GET /api/chats
  // -> List<ChatSummaryDto>
  // ---------------------------------------------
  const loadChats = async () => {
    const token = getToken();
    if (!token) {
      setChats([]);
      return;
    }
    if (!API_BASE_URL) {
      console.error("API_BASE_URL fehlt. Prüfe VITE_API_BASE_URL in Vercel.");
      setChats([]);
      return;
    }

    setLoadingChats(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "GET",
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : Array.isArray(data?.chats) ? data.chats : [];

      const normalized = list.map((c) => ({
        id: c.id || c.chatId,
        title: c.title || "Neuer Chat",
        createdAt: c.createdAt || c.created_at || null,
        updatedAt: c.updatedAt || c.updated_at || null,
      })).filter((c) => Boolean(c.id));

      // Sort: zuletzt aktiv oben
      normalized.sort((a, b) => {
        const ad = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bd = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bd - ad;
      });

      setChats(normalized);
    } catch (e) {
      console.error("Chats laden Fehler:", e);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  // initial load + when token changes
  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.token, API_BASE_URL]);

  // reload on focus
  useEffect(() => {
    const onFocus = () => loadChats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when Chatbot.jsx signals something changed
  useEffect(() => {
    const onChanged = () => loadChats();
    window.addEventListener("uniagent:chatsChanged", onChanged);
    return () => window.removeEventListener("uniagent:chatsChanged", onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------
  // Click-outside: 3-Punkte Menü schließen
  // ---------------------------------------------
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpenFor(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ---------------------------------------------
  // Neuer Chat -> Startseite
  // ---------------------------------------------
  const handleNewChat = () => {
    setMenuOpenFor(null);
    setSearchOpen(false);
    setSearchValue("");
    setActiveChatId(null);
    sessionStorage.removeItem("uniagentActiveChatId");
    navigate("/chat-start", { replace: false });
  };

  // ---------------------------------------------
  // Chat öffnen
  // ---------------------------------------------
  const openChat = (chatId) => {
    if (!chatId) return;
    setMenuOpenFor(null);
    setSearchOpen(false);
    setSearchValue("");
    setActiveChatId(chatId);
    sessionStorage.setItem("uniagentActiveChatId", chatId);
    navigate("/chat", { state: { chatId } });
  };

  // ---------------------------------------------
  // Chat löschen (TOKEN-BASIERT)
  // DELETE /api/chats/{chatId}
  // ---------------------------------------------
  const deleteChat = async (chatId) => {
    const token = getToken();
    if (!token || !chatId) return;

    setMenuOpenFor(null);

    // Optimistic UI
    setChats((prev) => prev.filter((c) => c.id !== chatId));

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      // Wenn gerade aktiver Chat gelöscht: auf Start
      if (activeChatId === chatId) {
        setActiveChatId(null);
        sessionStorage.removeItem("uniagentActiveChatId");
        navigate("/chat-start");
      }

      // Sidebar aktualisieren
      loadChats();
    } catch (e) {
      console.error("Chat löschen Fehler:", e);
      // Reload zur Sicherheit
      loadChats();
    }
  };

  // ---------------------------------------------
  // Suche: im Modal nur Frontend-Filter (schnell & robust)
  // ---------------------------------------------
  const filteredChats = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [chats, searchValue]);

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
            {/* Logo + Actions */}
            <div className="flex flex-col items-center gap-4 mt-1">
              <button
                type="button"
                onClick={() => navigate("/chat-start")}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm shadow-md"
                title="UNIAGENT"
              >
                🎓
              </button>

              <button
                onClick={() => setCollapsed(false)}
                title="Sidebar öffnen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">
                  menu
                </span>
              </button>

              <button
                title="Neuer Chat"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                onClick={handleNewChat}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">
                  add_2
                </span>
              </button>

              <button
                title="Chats suchen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition"
                onClick={() => {
                  setSearchOpen(true);
                  setSearchValue("");
                }}
                type="button"
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
                className="flex items-center gap-3"
                title="Zur Chat-Startseite"
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

            {/* Actions */}
            <nav className="flex flex-col gap-4 flex-1">
              <button
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
                onClick={handleNewChat}
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">
                  add_2
                </span>
                Neuer Chat
              </button>

              <button
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
                onClick={() => {
                  setSearchOpen(true);
                  setSearchValue("");
                }}
                type="button"
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
                    <div className="text-xs text-gray-600 px-2 py-2">
                      Lade Chats…
                    </div>
                  )}

                  {!loadingChats && chats.length === 0 && (
                    <div className="text-xs text-gray-600 px-2 py-2">
                      Noch keine Chats.
                    </div>
                  )}

                  {!loadingChats &&
                    chats.map((c) => {
                      const active = activeChatId === c.id;

                      return (
                        <div
                          key={c.id}
                          className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                            active
                              ? "bg-white shadow-sm ring-2 ring-[#98C73C]/30"
                              : "bg-white/80 hover:bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openChat(c.id)}
                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            title={c.title}
                          >
                            <span className="material-symbols-outlined text-[18px] text-gray-700">
                              chat_bubble
                            </span>
                            <span className="truncate text-gray-800">
                              {c.title || "Neuer Chat"}
                            </span>
                          </button>

                          {/* 3 Punkte (nur auf Hover sichtbar) */}
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenFor((prev) =>
                                prev === c.id ? null : c.id
                              );
                            }}
                            aria-label="Chat Optionen"
                            title="Optionen"
                          >
                            <span className="material-symbols-outlined text-[20px] text-gray-700">
                              more_horiz
                            </span>
                          </button>

                          {/* Dropdown */}
                          {menuOpenFor === c.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-2 top-10 z-50 w-44 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                onClick={() => deleteChat(c.id)}
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
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/35 flex items-center justify-center p-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-semibold text-gray-900">Chats suchen</div>
              <button
                type="button"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={() => setSearchOpen(false)}
                aria-label="Schließen"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Chat-Titel suchen…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  autoFocus
                />
              </div>

              <div className="mt-4 max-h-72 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="text-sm text-gray-500 py-6 text-center">
                    Keine Treffer.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredChats.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => openChat(c.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left"
                      >
                        <span className="material-symbols-outlined text-[20px] text-gray-700">
                          chat_bubble
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {c.title || "Neuer Chat"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.updatedAt || c.createdAt
                              ? new Date(c.updatedAt || c.createdAt).toLocaleString("de-DE")
                              : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50"
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
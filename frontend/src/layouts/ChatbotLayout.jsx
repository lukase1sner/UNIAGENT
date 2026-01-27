// src/layouts/ChatbotLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL as ENV_API_BASE_URL } from "../config";

export default function ChatbotLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Chats
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 3-dots menu
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }

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
  // Aktiver Chat: state + fallback sessionStorage
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
  // ---------------------------------------------
  const loadChats = async () => {
    const token = getToken();
    if (!token || !API_BASE_URL) {
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

      const normalized = list
        .map((c) => ({
          id: c.id || c.chatId,
          title: c.title || "Neuer Chat",
          createdAt: c.createdAt || c.created_at || null,
          updatedAt: c.updatedAt || c.updated_at || null,
        }))
        .filter((c) => Boolean(c.id));

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

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.token, API_BASE_URL]);

  useEffect(() => {
    const onFocus = () => loadChats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onChanged = () => loadChats();
    window.addEventListener("uniagent:chatsChanged", onChanged);
    return () => window.removeEventListener("uniagent:chatsChanged", onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------
  // Click-outside: Menü stabil schließen (data-attrs)
  // ---------------------------------------------
  useEffect(() => {
    const onDown = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;

      if (el.closest("[data-chat-menu-btn='1']")) return;
      if (el.closest("[data-chat-menu='1']")) return;

      setMenuOpenFor(null);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ---------------------------------------------
  // Actions
  // ---------------------------------------------
  const handleNewChat = async () => {
    setMenuOpenFor(null);
    setSearchOpen(false);
    setSearchValue("");

    const token = getToken();
    if (!token) {
      alert("Bitte neu einloggen (Token fehlt).");
      return;
    }
    if (!API_BASE_URL) {
      alert("API_BASE_URL fehlt (VITE_API_BASE_URL).");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ title: "Neuer Chat" }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      const data = await res.json().catch(() => ({}));
      const id = data.id || data.chatId;
      if (!id) throw new Error("Backend hat keine Chat-ID zurückgegeben.");

      setActiveChatId(id);
      sessionStorage.setItem("uniagentActiveChatId", id);

      // in den neuen Chat (nicht ChatbotStart!)
      navigate("/chat", { state: { chatId: id } });

      await loadChats();
      window.dispatchEvent(new Event("uniagent:chatsChanged"));
    } catch (e) {
      console.error("Neuer Chat fehlgeschlagen:", e);
      alert("Neuer Chat konnte nicht erstellt werden.");
    }
  };

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
  // Delete modal helpers
  // ---------------------------------------------
  const openDeleteModal = (chat) => {
    setMenuOpenFor(null);
    setDeleteTarget({ id: chat.id, title: chat.title || "Neuer Chat" });
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    const token = getToken();
    if (!token || !deleteTarget?.id) return;

    const chatId = deleteTarget.id;

    // Modal direkt zu
    closeDeleteModal();

    // Optimistic UI
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMenuOpenFor(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      if (activeChatId === chatId) {
        setActiveChatId(null);
        sessionStorage.removeItem("uniagentActiveChatId");
        navigate("/chat-start");
      }

      await loadChats();
      window.dispatchEvent(new Event("uniagent:chatsChanged"));
    } catch (e) {
      console.error("Chat löschen Fehler:", e);
      // Reload, damit UI sicher korrekt ist
      await loadChats();
    }
  };

  // ---------------------------------------------
  // Suche: Frontend-Filter
  // ---------------------------------------------
  const filteredChats = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [chats, searchValue]);

  // "Aktuell" Label nur vor aktivem Chat
  const hasActive = Boolean(activeChatId);
  const activeIndex = hasActive ? chats.findIndex((c) => c.id === activeChatId) : -1;
  const showAktuellLabel = hasActive && activeIndex >= 0;

  const formatDateDE = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("de-DE", { timeZone: "Europe/Berlin" }); // ✅ 1h Fix (UTC -> Berlin)
  };

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
          <div className="flex flex-col items-center justify-between h-full">
            <div className="flex flex-col items-center gap-4 mt-1">
              <button
                type="button"
                onClick={() => navigate("/chat-start")}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm shadow-md cursor-pointer"
                title="UNIAGENT"
              >
                🎓
              </button>

              <button
                onClick={() => setCollapsed(false)}
                title="Sidebar öffnen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>

              <button
                title="Neuer Chat"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition cursor-pointer"
                onClick={handleNewChat}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">add_2</span>
              </button>

              <button
                title="Chats suchen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition cursor-pointer"
                onClick={() => {
                  setSearchOpen(true);
                  setSearchValue("");
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">search</span>
              </button>
            </div>

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
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate("/chat-start")}
                className="flex items-center gap-3 cursor-pointer"
                title="Zur Chat-Startseite"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                  🎓
                </div>
                <span className="text-xl font-semibold tracking-tight">UNIAGENT</span>
              </button>

              <button
                onClick={() => setCollapsed(true)}
                title="Sidebar einklappen"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/70 transition cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">menu</span>
              </button>
            </div>

            {/* Actions */}
            <nav className="flex flex-col gap-4 flex-1">
              <button
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-gray-100 rounded-xl transition text-gray-700 cursor-pointer"
                onClick={handleNewChat}
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">add_2</span>
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
                <span className="material-symbols-outlined text-[22px]">search</span>
                Chats suchen
              </button>

              {/* Deine Chats */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Deine Chats</h3>

                <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
                  {loadingChats && (
                    <div className="text-xs text-gray-600 px-2 py-2">Lade Chats…</div>
                  )}

                  {!loadingChats && chats.length === 0 && (
                    <div className="text-xs text-gray-600 px-2 py-2">Noch keine Chats.</div>
                  )}

                  {!loadingChats &&
                    chats.map((c, idx) => {
                      const active = activeChatId === c.id;

                      return (
                        <React.Fragment key={c.id}>
                          {showAktuellLabel && idx === activeIndex && (
                            <div className="px-2 pt-1 pb-1 text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
                              Aktuell
                            </div>
                          )}

                          <div
                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                              active ? "bg-gray-300" : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => openChat(c.id)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                              title={c.title}
                            >
                              <span className="material-symbols-outlined text-[18px] text-gray-700">
                                chat_bubble
                              </span>
                              <span className="truncate text-gray-800">{c.title || "Neuer Chat"}</span>
                            </button>

                            {/* 3 Punkte: IMMER sichtbar + cursor-pointer */}
                            <button
                              type="button"
                              data-chat-menu-btn="1"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenFor((prev) => (prev === c.id ? null : c.id));
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
                                data-chat-menu="1"
                                className="absolute right-2 top-10 z-50 w-44 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 cursor-pointer"
                                  onClick={() => openDeleteModal(c)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                  Chat löschen
                                </button>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
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
              <div className="text-gray-800 font-medium leading-tight">{getFullName(currentUser)}</div>
            </div>
          </>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>

      {/* SEARCH MODAL (ohne unteren Schließen-Button) */}
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
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={() => setSearchOpen(false)}
                aria-label="Schließen"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
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
                  <div className="text-sm text-gray-500 py-6 text-center">Keine Treffer.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredChats.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => openChat(c.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-left cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px] text-gray-700">
                          chat_bubble
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {c.title || "Neuer Chat"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateDE(c.updatedAt || c.createdAt)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/35 flex items-center justify-center p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-semibold text-gray-900">Chat löschen?</div>
              <button
                type="button"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={closeDeleteModal}
                aria-label="Schließen"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="text-sm text-gray-600">
                Möchtest du den Chat{" "}
                <span className="font-semibold text-gray-900">
                  {deleteTarget?.title || "Neuer Chat"}
                </span>{" "}
                wirklich löschen?
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
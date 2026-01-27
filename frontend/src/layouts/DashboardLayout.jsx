// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/LandingLayout.css";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const gradientStyle = {
    backgroundImage:
      "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
  };

  // 🔄 User aus LocalStorage laden
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

  // ✅ Mobile Menü offen -> Hintergrund scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [mobileMenuOpen]);

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

  const handleConfirmLogout = () => {
    localStorage.removeItem("uniagentUser");
    setShowLogoutModal(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // kleine Helper-Funktion für Navigation (schließt auch das Mobile-Menü)
  const goTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // ✅ aktiver Menüpunkt per Route
  const isActive = (path) => location.pathname === path;

  // Mobile Menü-Items (gleiches "Design-System" wie Sidebar)
  const mobileItems = [
    { icon: "team_dashboard", label: "Dashboard", path: "/dashboard" },
    { icon: "question_exchange", label: "Häufig gestellte Fragen", path: "/haufig" },
    { icon: "link", label: "Nützliche Links", path: "/nuetzliche-links" },
    { icon: "chat", label: "Chatbot fragen", path: "/chat-start" },
    { icon: "person", label: "Mein Bereich", path: "/mein-bereich" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="w-full py-4 px-4 lg:py-6 lg:px-10 flex justify-between items-center bg-[#E4ECD9] shadow-sm">
        <div
          className="flex items-center gap-3 select-none cursor-pointer"
          // ✅ Klick auf Logo/UNIAGENT -> Dashboard
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
            🎓
          </div>
          <span className="text-xl font-semibold tracking-tight">UNIAGENT</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black font-medium
                       hover:bg-black hover:text-white transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Abmelden
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex lg:hidden w-10 h-10 items-center justify-center rounded-full
                       hover:bg-white/70 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU (Fullscreen + ohne Avatar/Name) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white/55 backdrop-blur-xl">
          {/* Top bar */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/60">
            <div
              className="flex items-center gap-3 select-none cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/dashboard"); // ✅ auch hier Dashboard
              }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                🎓
              </div>
              <span className="text-lg font-semibold tracking-tight">
                UNIAGENT
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#d6dfc9] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">
                close
              </span>
            </button>
          </div>

          {/* Items + Logout */}
          {/* ✅ Menü selbst scrollt, Hintergrund nicht */}
          <div className="px-4 py-5 flex flex-col h-[calc(100vh-72px)] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col gap-2">
              {mobileItems.map((item) => {
                const active = item.path ? isActive(item.path) : false;

                return (
                  <button
                    key={item.icon}
                    onClick={() => {
                      if (item.path) goTo(item.path);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer font-medium ${
                      active
                        ? "bg-[#E4ECD9] hover:bg-[#d6dfc9] text-gray-900"
                        : "text-gray-700 hover:bg-[#d6dfc9]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-black text-white font-medium
                           hover:bg-[#111] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* DESKTOP */}
        <div className="hidden lg:flex flex-1 relative isolate" style={gradientStyle}>
          {/* SIDEBAR (GLASS) */}
          <aside
            className={`${
              collapsed ? "w-20" : "w-72"
            } relative z-50 bg-white/35 backdrop-blur-xl border-r border-white/40 shadow-none flex flex-col p-4 transition-all duration-300`}
          >
            {collapsed ? (
              <div className="flex flex-col items-center h-full">
                {/* MENU ICON */}
                <div className="relative group">
                  <button
                    onClick={() => setCollapsed(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#d6dfc9] transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      menu
                    </span>
                  </button>

                  {/* Tooltip */}
                  <div
                    className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2
                               bg-black text-white text-xs rounded px-2 py-1 opacity-0
                               group-hover:opacity-100 transition-opacity z-[9999]"
                  >
                    Menü maximieren
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 mt-4">
                  {/* Dashboard Icon */}
                  <div className="relative group">
                    <button
                      onClick={() => goTo("/dashboard")}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition cursor-pointer ${
                        isActive("/dashboard")
                          ? "bg-[#E4ECD9] hover:bg-[#d6dfc9]"
                          : "hover:bg-[#d6dfc9]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        team_dashboard
                      </span>
                    </button>

                    {/* Tooltip */}
                    <div
                      className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2
                                 bg-black text-white text-xs rounded px-2 py-1 opacity-0
                                 group-hover:opacity-100 transition-opacity z-[9999]"
                    >
                      Dashboard
                    </div>
                  </div>

                  {[
                    ["question_exchange", "Häufig gestellte Fragen"],
                    ["link", "Nützliche Links"],
                    ["chat", "Chatbot fragen"],
                    ["person", "Mein Bereich"],
                  ].map(([icon, label]) => {
                    const path =
                      label === "Chatbot fragen"
                        ? "/chat-start"
                        : label === "Mein Bereich"
                        ? "/mein-bereich"
                        : label === "Nützliche Links"
                        ? "/nuetzliche-links"
                        : label === "Häufig gestellte Fragen"
                        ? "/haufig"
                        : null;

                    const active = path ? isActive(path) : false;

                    return (
                      <div key={icon} className="relative group">
                        <button
                          onClick={() => {
                            if (path) goTo(path);
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition cursor-pointer ${
                            active
                              ? "bg-[#E4ECD9] hover:bg-[#d6dfc9]"
                              : "hover:bg-[#d6dfc9]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {icon}
                          </span>
                        </button>

                        {/* Tooltip */}
                        <div
                          className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2
                                     bg-black text-white text-xs rounded px-2 py-1 opacity-0
                                     group-hover:opacity-100 transition-opacity z-[9999]"
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#98C73C] text-black flex items-center justify-center font-semibold text-sm cursor-pointer">
                    {getInitials(currentUser)}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end mb-6">
                  <div className="relative group">
                    <button
                      onClick={() => setCollapsed(true)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#d6dfc9] transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        menu
                      </span>
                    </button>

                    {/* Tooltip */}
                    <div
                      className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2
                                 bg-black text-white text-xs rounded px-2 py-1 opacity-0
                                 group-hover:opacity-100 transition-opacity z-[9999]"
                    >
                      Menü minimieren
                    </div>
                  </div>
                </div>

                <nav className="flex flex-col gap-4 flex-1">
                  {[
                    ["team_dashboard", "Dashboard", isActive("/dashboard")],
                    ["question_exchange", "Häufig gestellte Fragen", isActive("/haufig")],
                    ["link", "Nützliche Links", isActive("/nuetzliche-links")],
                    ["chat", "Chatbot fragen", isActive("/chat-start")],
                    ["person", "Mein Bereich", isActive("/mein-bereich")],
                  ].map(([icon, label, active]) => (
                    <button
                      key={icon}
                      onClick={() => {
                        if (icon === "team_dashboard") goTo("/dashboard");
                        if (icon === "question_exchange") goTo("/haufig");
                        if (icon === "chat") goTo("/chat-start");
                        if (icon === "link") goTo("/nuetzliche-links");
                        if (icon === "person") goTo("/mein-bereich");
                      }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition cursor-pointer font-medium ${
                        active
                          ? "bg-[#E4ECD9] hover:bg-[#d6dfc9] text-gray-900"
                          : "text-gray-700 hover:bg-[#d6dfc9]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {icon}
                      </span>
                      {label}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 flex items-center gap-3 cursor-pointer">
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

          <section className="flex-1 flex flex-col relative z-0">
            <Outlet />
          </section>
        </div>

        {/* MOBILE CONTENT */}
        <div className="flex lg:hidden flex-1" style={gradientStyle}>
          <section className="flex-1 flex flex-col">
            <Outlet />
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E4ECD9] mt-0 py-8">
        {/* MOBILE — linksbündig */}
        <div className="w-full px-6 flex flex-col gap-3 text-sm text-black lg:hidden text-left">
          <a href="#funktionen" className="hover:underline transition">
            Funktionen
          </a>
          <a href="#kontakt" className="hover:underline transition">
            Kontakt
          </a>
          <a href="/impressum" className="hover:underline transition">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:underline transition">
            Datenschutz
          </a>

          <span className="font-medium pt-2">
            © {new Date().getFullYear()} UNIAGENT
          </span>
        </div>

        {/* DESKTOP — eine Reihe, © am ENDE */}
        <div className="hidden lg:flex w-full items-center justify-center gap-6 text-sm text-black">
          <a href="#funktionen" className="hover:underline transition cursor-pointer">
            Funktionen
          </a>
          <a href="#kontakt" className="hover:underline transition cursor-pointer">
            Kontakt
          </a>
          <a href="/impressum" className="hover:underline transition cursor-pointer">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:underline transition cursor-pointer">
            Datenschutz
          </a>

          <span className="font-medium">
            © {new Date().getFullYear()} UNIAGENT
          </span>
        </div>
      </footer>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Abmelden
            </h2>
            <p className="text-sm text-gray-600">
              Möchtest du dich wirklich abmelden?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Abbrechen
              </button>

              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
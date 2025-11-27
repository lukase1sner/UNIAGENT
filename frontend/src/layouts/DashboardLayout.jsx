// src/layouts/DashboardLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Home, HelpCircle, Link as LinkIcon, Bot, User } from "lucide-react";
import "../styles/Dashboard.css";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const iconSize = 22; // ICON-GRÖSSE ÜBERALL GLEICH

  const location = useLocation();

  // helper: prüft, ob der Link aktiv ist (prefix-check)
  const isActive = (path) => {
    if (!location || !location.pathname) return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20">
        <h1 className="text-2xl font-bold tracking-tight">UNIAGENT</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="hidden sm:inline">Willkommen, Lukas</span>
          <button className="px-5 py-2 rounded-full border border-black font-medium hover:bg-black hover:text-white transition">
            Abmelden
          </button>
        </div>
      </header>

      <div
        className="flex flex-1 overflow-hidden"
        style={{
          "--sidebar-width": open ? "260px" : "80px",
        }}
      >
        {/* Sidebar */}
        <aside
          className={`${open ? "w-[260px]" : "w-[80px]"} transition-all duration-300 bg-gray-300 border-r border-gray-200 flex flex-col z-10`}
        >
          <nav className="px-4 py-4 flex-1">
            <ul className="flex flex-col gap-8">

              {/* Menü Toggle */}
              <li>
                <button
                  onClick={() => setOpen(!open)}
                  aria-label="Sidebar umschalten"
                  className={`
                    flex items-center p-2 rounded-lg transition
                    ${open ? "hover:bg-gray-100 w-auto" : "hover:bg-gray-100 w-full justify-center"}
                  `}
                >
                  <Menu size={iconSize} className="text-gray-700" />
                </button>
              </li>

              {/* Dashboard */}
              <li>
                <Link
                  to="/dashboard"
                  className={`
                    flex p-2 rounded-lg transition
                    ${open ? "items-center gap-3" : "justify-center"}
                    hover:bg-gray-100
                    ${isActive("/dashboard") ? "bg-gray-100" : ""}
                  `}
                >
                  <Home size={iconSize} className="text-gray-600" />
                  {open && <span className="text-sm">Dashboard</span>}
                </Link>
              </li>

              {/* FAQ */}
              <li>
                <Link
                  to="/dashboard/faq"
                  className={`
                    flex p-2 rounded-lg transition
                    ${open ? "items-center gap-3" : "justify-center"}
                    hover:bg-gray-100
                    ${isActive("/dashboard/faq") ? "bg-gray-100" : ""}
                  `}
                >
                  <HelpCircle size={iconSize} className="text-sky-600" />
                  {open && <span className="text-sm">Häufig gestellte Fragen</span>}
                </Link>
              </li>

              {/* Links */}
              <li>
                <Link
                  to="/dashboard/links"
                  className={`
                    flex p-2 rounded-lg transition
                    ${open ? "items-center gap-3" : "justify-center"}
                    hover:bg-gray-100
                    ${isActive("/dashboard/links") ? "bg-gray-100" : ""}
                  `}
                >
                  <LinkIcon size={iconSize} className="text-teal-600" />
                  {open && <span className="text-sm">Nützliche Links</span>}
                </Link>
              </li>

              {/* Chatbot */}
              <li>
                <Link
                  to="/chat"
                  className={`
                    flex p-2 rounded-lg transition
                    ${open ? "items-center gap-3" : "justify-center"}
                    hover:bg-gray-100
                    ${isActive("/chat") ? "bg-gray-100" : ""}
                  `}
                >
                  <Bot size={iconSize} className="text-purple-600" />
                  {open && <span className="text-sm">Chatbot fragen</span>}
                </Link>
              </li>

              {/* Mein Bereich */}
              <li>
                <Link
                  to="/dashboard/me"
                  className={`
                    flex p-2 rounded-lg transition
                    ${open ? "items-center gap-3" : "justify-center"}
                    hover:bg-gray-100
                    ${isActive("/dashboard/me") ? "bg-gray-100" : ""}
                  `}
                >
                  <User size={iconSize} className="text-amber-700" />
                  {open && <span className="text-sm">Mein Bereich</span>}
                </Link>
              </li>

            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-3 text-center text-sm text-black-500">
        © 2025 UNIAGENT
      </footer>
    </div>
  );
}

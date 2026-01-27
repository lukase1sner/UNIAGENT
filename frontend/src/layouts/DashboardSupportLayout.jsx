// src/layouts/DashboardSupportLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function DashboardSupportLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("uniagentUser") || "{}");
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Support";

  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "SU";

  const handleLogout = () => {
    localStorage.removeItem("uniagentUser");
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage:
          "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className={
          "relative flex flex-col bg-white/35 backdrop-blur-xl border-r border-white/40 " +
          "shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 " +
          (collapsed ? "w-20" : "w-80")
        }
      >
        {/* ===== TOP: BRAND + TOGGLE ===== */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            {/* ✅ Altes Logo wieder drin */}
            <div
              className={
                "flex items-center gap-3 select-none cursor-pointer " +
                (collapsed ? "justify-center w-full" : "")
              }
              onClick={() => navigate("/support-dashboard")}
              title="Support Dashboard"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                🎓
              </div>

              {!collapsed && (
                <div className="leading-tight text-left">
                  <div className="text-sm font-semibold tracking-tight text-gray-900">
                    UNIAGENT
                  </div>
                  <div className="text-xs text-gray-600">Support</div>
                </div>
              )}
            </div>

            {/* Toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-gray-900 shadow-sm transition hover:bg-white/80 cursor-pointer"
              title={collapsed ? "Sidebar öffnen" : "Sidebar schließen"}
            >
              <span className="material-symbols-outlined text-[22px]">
                {collapsed ? "chevron_right" : "chevron_left"}
              </span>
            </button>
          </div>

          {/* ❌ Trennlinie unter Logo entfernt */}
        </div>

        {/* ===== MIDDLE (divider centered) ===== */}
        <div className="relative flex-1">
          {/* CENTER DIVIDER (sichtbar) */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 px-4">
            <div className="h-px w-full bg-gray-400/80" />
          </div>

          {/* USER – direkt unter der mittigen Trennlinie */}
          <div className="absolute left-0 right-0 top-1/2 px-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white font-bold">
                {initials}
              </div>

              {!collapsed && (
                <div className="truncate text-sm font-semibold text-gray-900">
                  {fullName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM: LOGOUT (left aligned, no button look) ===== */}
        <div className="px-4 pb-6 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer"
            title="Abmelden"
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              logout
            </span>

            {!collapsed && (
              <span className="hover:underline underline-offset-4 transition">
                Abmelden
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
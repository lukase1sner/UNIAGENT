import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DashboardSupportLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("uniagentUser") || {});
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Support";

  const initialsRaw =
    `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`.trim();
  const initials = initialsRaw || "SU";

  const handleLogout = () => {
    localStorage.removeItem("uniagentUser");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={
          "flex flex-col bg-black px-4 py-6 text-white transition-all duration-300 " +
          (collapsed ? "w-20" : "w-72")
        }
      >
        {/* Top: Toggle + Brand */}
        <div className="mb-8 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
                🎓
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  UNIAGENT
                </div>
                <div className="text-xs text-white/70">Support</div>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            title={collapsed ? "Sidebar öffnen" : "Sidebar schließen"}
          >
            <span className="material-symbols-outlined text-[22px]">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Card unten */}
        <div
          className={
            "rounded-2xl bg-white/5 " + (collapsed ? "p-2" : "p-3")
          }
        >
          <div
            className={
              "flex items-center " +
              (collapsed ? "justify-center" : "gap-3")
            }
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {fullName}
                </div>
                <div className="truncate text-xs text-white/70">
                  {user?.email || ""}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-white/15"
            >
              Abmelden
            </button>
          )}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
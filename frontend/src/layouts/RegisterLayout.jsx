// src/layouts/RegisterLayout.jsx
import { Outlet } from "react-router-dom";
import "../styles/Register.css"; // darf bleiben, macht aber nichts mehr

export default function RegisterLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 md:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-md">
            🎓
          </div>
          <span className="text-lg font-semibold tracking-tight">
            UNIAGENT
          </span>
        </div>

        <nav className="hidden gap-8 text-sm font-medium text-gray-800 md:flex">
          <a href="/" className="hover:text-[#98C73C]">Startseite</a>
          <a href="/#funktionen" className="hover:text-[#98C73C]">Funktionen</a>
          <a href="/#kontakt" className="hover:text-[#98C73C]">Kontakt</a>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-20 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full flex justify-center">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 bg-[#98C73C] py-4 text-center text-xs text-white md:text-sm">
        <p className="font-medium">© 2025 UNIAGENT</p>
        <div className="mt-1 flex justify-center gap-6">
          <a href="#" className="hover:underline">Datenschutz</a>
          <a href="#" className="hover:underline">Impressum</a>
          <a href="#" className="hover:underline">Kontakt</a>
        </div>
      </footer>
    </div>
  );
}

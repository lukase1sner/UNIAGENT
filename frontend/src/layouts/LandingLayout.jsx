import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingLayout.css";

export default function LandingLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full py-6 px-10 flex justify-between items-center bg-[#E4ECD9] shadow-sm">
        <div
          className="flex items-center gap-3 select-none cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
            🎓
          </div>
          <span className="text-xl font-semibold tracking-tight">UNIAGENT</span>
        </div>

        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a
            href="#startseite"
            className="text-black font-semibold border-b-2 border-black pb-1"
          >
            Startseite
          </a>
          <a href="#funktionen" className="hover:text-black transition">
            Funktionen
          </a>
          <a href="#kontakt" className="hover:text-black transition">
            Kontakt
          </a>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-black font-medium
                     hover:bg-black hover:text-white transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">
            login
          </span>
          Anmelden
        </button>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#E4ECD9] mt-0 py-8">
        <div className="w-full px-6 flex flex-col gap-3 text-sm text-black lg:hidden text-left">
          <a href="#funktionen" className="hover:text-gray-800 transition">
            Funktionen
          </a>
          <a href="#kontakt" className="hover:text-gray-800 transition">
            Kontakt
          </a>
          <a href="/impressum" className="hover:text-gray-800 transition">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:text-gray-800 transition">
            Datenschutz
          </a>

          <span className="font-medium pt-2">
            © {new Date().getFullYear()} UNIAGENT
          </span>
        </div>

        <div className="hidden lg:flex w-full items-center justify-center gap-6 text-sm text-black">
          <a
            href="#funktionen"
            className="hover:text-gray-800 transition cursor-pointer"
          >
            Funktionen
          </a>
          <a
            href="#kontakt"
            className="hover:text-gray-800 transition cursor-pointer"
          >
            Kontakt
          </a>
          <a
            href="/impressum"
            className="hover:text-gray-800 transition cursor-pointer"
          >
            Impressum
          </a>
          <a
            href="/datenschutz"
            className="hover:text-gray-800 transition cursor-pointer"
          >
            Datenschutz
          </a>

          <span className="font-medium">
            © {new Date().getFullYear()} UNIAGENT
          </span>
        </div>
      </footer>
    </div>
  );
}
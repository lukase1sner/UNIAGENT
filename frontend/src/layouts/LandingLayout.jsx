// src/layouts/LandingLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingLayout.css";

export default function LandingLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className="w-full py-6 px-10 flex justify-between items-center bg-[#E4ECD9] shadow-sm">

        {/* UNIAGENT Logo – wie Register & Chatbot */}
        <div className="flex items-center gap-3 select-none cursor-pointer"
             onClick={() => navigate("/")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
            🎓
          </div>
          <span className="text-xl font-semibold tracking-tight">UNIAGENT</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a
            href="#startseite"
            className="text-black font-semibold border-b-2 border-black pb-1"
          >
            Startseite
          </a>
          <a href="#funktionen" className="hover:text-black transition">Funktionen</a>
          <a href="#kontakt" className="hover:text-black transition">Kontakt</a>
        </nav>

        {/* Anmelden Button → führt korrekt zu /login */}
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full border border-black font-medium
                     hover:bg-black hover:text-white transition cursor-pointer"
        >
          Anmelden
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#E4ECD9] mt-0">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row
                        items-center justify-between gap-6">

          <p className="text-black text-sm">
            © {new Date().getFullYear()} UNIAGENT
          </p>

          <div className="flex items-center gap-6 text-sm text-black">
            <a href="#funktionen" className="hover:text-gray-800 transition">Funktionen</a>
            <a href="#kontakt" className="hover:text-gray-800 transition">Kontakt</a>
            <a href="/impressum" className="hover:text-gray-800 transition">Impressum</a>
            <a href="/datenschutz" className="hover:text-gray-800 transition">Datenschutz</a>
          </div>

        </div>
      </footer>

    </div>
  );
}

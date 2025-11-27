// src/layouts/LandingLayout.jsx
import React from "react";
import "../styles/LandingLayout.css";

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="w-full py-6 px-10 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2 select-none">
          <span className="text-3xl">🎓</span>
          <h1 className="text-2xl font-bold tracking-tight">UNIAGENT</h1>
        </div>

        <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
          <a
            href="#startseite"
            className="text-black font-semibold border-b-2 border-black pb-1"
          >
            Startseite
          </a>
          <a href="#funktionen" className="hover:text-black transition">Funktionen</a>
          <a href="#kontakt" className="hover:text-black transition">Kontakt</a>
        </nav>

        <button
          className="px-5 py-2 rounded-full border border-black font-medium
                     hover:bg-black hover:text-white transition cursor-pointer"
        >
          Anmelden
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      <footer className="bg-white mt-0">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row
                        items-center justify-between gap-6">

          {/* Left Section */}
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} UNIAGENT
          </p>

          {/* Right Section – Links */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#funktionen" className="hover:text-black transition">Funktionen</a>
            <a href="#kontakt" className="hover:text-black transition">Kontakt</a>
            <a href="/impressum" className="hover:text-black transition">Impressum</a>
            <a href="/datenschutz" className="hover:text-black transition">Datenschutz</a>
          </div>

        </div>
      </footer>

    </div>
  );
}
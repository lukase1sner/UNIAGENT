// src/layouts/PasswordaendernLayout.jsx
import { Outlet } from "react-router-dom";
import "../styles/Register.css";

export default function PasswordaendernLayout() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
      }}
    >
      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 md:px-16">
        <div className="flex items-center gap-3">
          {/* UNIAGENT Logo Kreis – weiß */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
            🎓
          </div>

          <span className="text-lg font-semibold tracking-tight">UNIAGENT</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-black md:flex">
          <a href="/#startseite" className="hover:text-gray-800 transition">
            Startseite
          </a>
          <a href="/#funktionen" className="hover:text-gray-800 transition">
            Funktionen
          </a>
          <a href="/#kontakt" className="hover:text-gray-800 transition">
            Kontakt
          </a>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-10 pt-4 md:px-16 md:pb-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 md:flex-row md:items-stretch md:gap-16">
          {/* LEFT SECTION */}
          <section className="flex-1 text-center md:text-left">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-black md:text-4xl">
              Ändere dein{" "}
              <span className="underline decoration-[#98C73C] decoration-4">
                Passwort
              </span>
            </h1>

            {/* INFOBOX */}
            <div className="mt-8 max-w-xl rounded-3xl bg-white/70 p-6 md:p-7 shadow-md border border-white/60 text-left">
              <p className="mb-4 text-sm leading-relaxed text-gray-900">
                Aus Sicherheitsgründen empfehlen wir ein{" "}
                <span className="font-semibold">starkes Passwort</span> mit
                Groß-/Kleinschreibung, Zahlen und Sonderzeichen.
              </p>

              <ul className="space-y-2 text-sm leading-relaxed text-gray-900 list-disc pl-5">
                <li>
                  <span className="font-semibold">Mindestens 8 Zeichen</span>
                </li>
                <li>
                  <span className="font-semibold">1 Großbuchstabe</span>,{" "}
                  <span className="font-semibold">1 Zahl</span> und{" "}
                  <span className="font-semibold">1 Sonderzeichen</span>
                </li>
                <li>
                  Kein direkter Bezug zur{" "}
                  <span className="font-semibold">E-Mail-Adresse</span>
                </li>
                <li>
                  Verwende kein Passwort, das du bereits woanders nutzt
                </li>
              </ul>
            </div>
          </section>

          {/* RIGHT: FORM (OUTLET) */}
          <section className="flex-1 flex items-center justify-center w-full">
            <Outlet />
          </section>
        </div>
      </main>

      {/* FOOTER – wie Login/Dashboard */}
      <footer className="bg-[#E4ECD9] mt-0 py-8">
        {/* MOBILE */}
        <div className="w-full px-6 flex flex-col gap-3 text-sm text-black lg:hidden text-left">
          <a href="/#funktionen" className="hover:text-gray-800 transition">
            Funktionen
          </a>
          <a href="/#kontakt" className="hover:text-gray-800 transition">
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

        {/* DESKTOP */}
        <div className="hidden lg:flex w-full items-center justify-center gap-6 text-sm text-black">
          <a
            href="/#funktionen"
            className="hover:text-gray-800 transition cursor-pointer"
          >
            Funktionen
          </a>
          <a
            href="/#kontakt"
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

          <span className="font-medium">© {new Date().getFullYear()} UNIAGENT</span>
        </div>
      </footer>
    </div>
  );
}

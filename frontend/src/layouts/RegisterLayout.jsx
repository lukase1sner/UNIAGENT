import { Outlet } from "react-router-dom";
import "../styles/Register.css";

export default function RegisterLayout() {
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
          {/* UNIAGENT Logo Kreis – jetzt weiß */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-md">
            🎓
          </div>

          <span className="text-lg font-semibold tracking-tight">
            UNIAGENT
          </span>
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
          {/* LEFT SECTION – HEADING + INFOBOX */}
          <section className="flex-1 text-center md:text-left">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-black md:text-4xl">
              Willkommen bei{" "}
              <span className="underline decoration-[#98C73C] decoration-4">
                UNIAGENT
              </span>
            </h1>

            {/* INFOBOX: PROJEKT 24/7-HOCHSCHUL-AGENT */}
            <div className="mt-8 max-w-xl rounded-3xl bg-white/70 p-6 md:p-7 shadow-md border border-white/60 text-left">
              <p className="mb-4 text-sm leading-relaxed text-gray-900">
                <span className="font-semibold">UNIAGENT</span> ist ein
                funktionaler Prototyp eines{" "}
                <span className="font-semibold">
                  24/7-Hochschul-Assistenzsystems
                </span>{" "}
                mit <span className="font-semibold">Frontend</span>,{" "}
                <span className="font-semibold">Workflow-Logik</span> und{" "}
                <span className="font-semibold">Support-Dashboard</span>.
              </p>

              <ul className="space-y-2 text-sm leading-relaxed text-gray-900 list-disc pl-5">
                <li>
                  <span className="font-semibold">
                    Fokus auf komplexe Fälle:
                  </span>{" "}
                  Mitarbeitende können sich auf anspruchsvolle Anliegen
                  konzentrieren.
                </li>
                <li>
                  <span className="font-semibold">Schnelle Antworten:</span>{" "}
                  Verlässliche Reaktionen senken die Hemmschwelle bei
                  Studieninteressierten.
                </li>
                <li>
                  <span className="font-semibold">Weniger E-Mails:</span> Kürzere
                  Reaktionszeiten für individuelle Anliegen.
                </li>
                <li>
                  <span className="font-semibold">24/7-Verfügbarkeit:</span>{" "}
                  signalisiert Zugänglichkeit und Professionalität.
                </li>
              </ul>
            </div>
          </section>

          {/* RIGHT: REGISTER FORM (OUTLET) */}
          <section className="flex-1 flex items-center justify-center w-full">
            <Outlet />
          </section>
        </div>
      </main>

      {/* FOOTER – #E4ECD9 */}
      <footer className="bg-[#E4ECD9] mt-0">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-black text-sm">
            © {new Date().getFullYear()} UNIAGENT
          </p>

          <div className="flex items-center gap-6 text-sm text-black">
            <a href="/#funktionen" className="hover:text-black/70 transition">
              Funktionen
            </a>
            <a href="/#kontakt" className="hover:text-black/70 transition">
              Kontakt
            </a>
            <a href="/impressum" className="hover:text-black/70 transition">
              Impressum
            </a>
            <a href="/datenschutz" className="hover:text-black/70 transition">
              Datenschutz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

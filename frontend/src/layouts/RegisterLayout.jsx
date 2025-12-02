import { Outlet } from "react-router-dom";
import "../styles/Register.css";

export default function RegisterLayout() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)"
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

      {/* FOOTER – #E4ECD9 */}
      <footer className="bg-[#E4ECD9] mt-0">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row
                        items-center justify-between gap-6">

          <p className="text-black text-sm">
            © {new Date().getFullYear()} UNIAGENT
          </p>

          <div className="flex items-center gap-6 text-sm text-black">
            <a href="/#funktionen" className="hover:text-gray-800 transition">Funktionen</a>
            <a href="/#kontakt" className="hover:text-gray-800 transition">Kontakt</a>
            <a href="/impressum" className="hover:text-gray-800 transition">Impressum</a>
            <a href="/datenschutz" className="hover:text-gray-800 transition">Datenschutz</a>
          </div>

        </div>
      </footer>
    </div>
  );
}

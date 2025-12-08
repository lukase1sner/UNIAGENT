// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";

// Animation CSS + Hook
import "../styles/scrollAnimations.css";
import useScrollFadeIn from "../hooks/useScrollFadeIn";

// Bild importieren
import ChatStart from "../assets/ChatStart.jpg";

export default function Landing() {
  useScrollFadeIn(); // Scroll Animation aktivieren
  const navigate = useNavigate();

  return (
    <LandingLayout>

      {/* HERO SECTION */}
      <section className="w-full pt-28 pb-50 text-center bg-gray-50">
        <h2 className="fade-element text-4xl md:text-6xl font-bold tracking-tight text-black">
          KI-gestützter Support für Studierende <br className="hidden md:block" />
          und Studieninteressierte
        </h2>

        <p className="fade-element fade-delay-1 mt-4 text-xl md:text-2xl text-gray-500">
          Hochschulservice entlasten und gleichzeitig schnelle, konsistente Auskünfte ermöglichen.
        </p>

        {/* Button → führt zu /register */}
        <button
          onClick={() => navigate("/register")}
          className="fade-element fade-delay-2 mt-6 px-6 py-3 bg-[#E4ECD9] text-black rounded-lg font-medium
                     cursor-pointer transition-colors duration-200 hover:bg-[#d5dfc8]"
        >
          UNIAGENT ausprobieren
        </button>
      </section>

      {/* FEATURE SECTION */}
      <section
        id="features"
        className="w-full py-32 px-4 md:px-8"
        style={{
          backgroundImage:
            "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Textblock */}
          <div className="fade-element">
            <h3 className="text-2xl font-semibold mb-3">24/7 Verfügbarkeit.</h3>
            <p className="text-gray-600 leading-relaxed">
              Ein KI-gestützter Chatbot beantwortet zu jeder Zeit organisatorische und
              studienbezogene Fragen.
            </p>
          </div>

          {/* Bild */}
          <div className="fade-element fade-delay-1 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={ChatStart}
              alt="UNIAGENT Chat Start"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* USE CASE SECTION */}
      <section className="bg-gray-50 py-32 px-4 md:px-8">
        <h2 className="fade-element text-3xl md:text-4xl font-bold text-center mb-4">
          So setzen Hochschulen und Studierende UNIAGENT ein
        </h2>



        {/* Cards breit, damit Titel in einer Zeile bleibt */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Card 1 */}
          <div className="fade-element fade-delay-1 flex flex-col justify-between h-full
                          bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
            <div>
              <span className="material-symbols-outlined text-[32px] text-[#98C73C] mb-4 block">
                tooltip_2
              </span>

              {/* Titel – kleinere Typografie, damit eine Zeile möglich wird */}
              <h3 className="text-base md:text-lg font-semibold leading-snug mb-3">
                Organisatorische Fragen sofort klären
              </h3>

              <p className="text-gray-700 leading-relaxed">
                Studierende erhalten rund um die Uhr präzise Antworten zu Rückmeldung,
                Bewerbung, Fristen und Verwaltungsabläufen, ohne lange Wartezeiten.
              </p>
            </div>

            <p className="mt-4 italic text-gray-500">
              Direkter Zugang zu wichtigen Informationen.
            </p>
          </div>

          {/* Card 2 */}
          <div className="fade-element fade-delay-2 flex flex-col justify-between h-full
                          bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
            <div>
              <span className="material-symbols-outlined text-[32px] text-[#98C73C] mb-4 block">
                manage_search
              </span>

              <h3 className="text-base md:text-lg font-semibold leading-snug mb-3">
                Anfragen intelligent zuordnen
              </h3>

              <p className="text-gray-700 leading-relaxed">
                UNIAGENT erkennt automatisch die Kategorie jeder Anfrage und entscheidet,
                ob sie beantwortet oder an den Support weitergeleitet wird.
              </p>
            </div>

            <p className="mt-4 italic text-gray-500">
              Manuelle Arbeit reduzieren.
            </p>
          </div>

          {/* Card 3 */}
          <div className="fade-element fade-delay-3 flex flex-col justify-between h-full
                          bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
            <div>
              <span className="material-symbols-outlined text-[32px] text-[#98C73C] mb-4 block">
                bar_chart
              </span>

              <h3 className="text-base md:text-lg font-semibold leading-snug mb-3">
                Dashboard für den Überblick
              </h3>

              <p className="text-gray-700 leading-relaxed">
                Support-Mitarbeitende sehen, wie viele Anfragen eingehen, wie viele automatisch
                beantwortet wurden und welche noch offen sind.
              </p>
            </div>

            <p className="mt-4 italic text-gray-500">
              Transparenz in Echtzeit.
            </p>
          </div>

        </div>
      </section>

    </LandingLayout>
  );
}

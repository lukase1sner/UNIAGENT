// src/pages/Landing.jsx
import React from "react";
import LandingLayout from "../layouts/LandingLayout";

// Animation CSS + Hook
import "../styles/scrollAnimations.css";
import useScrollFadeIn from "../hooks/useScrollFadeIn";

export default function Landing() {
  useScrollFadeIn(); // Scroll Animation aktivieren

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

        <button
          onClick={() => console.log("UNIAGENT ausprobieren clicked")}
          className="fade-element fade-delay-2 mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium
                     cursor-pointer transition-all duration-300 transform
                     hover:bg-gray-800 hover:scale-105"
        >
          UNIAGENT ausprobieren
        </button>
      </section>

      {/* FEATURE SECTION */}
      <section
        id="features"
        className="bg-white grid grid-cols-1 md:grid-cols-2 gap-16
                   max-w-6xl mx-auto px-8 py-32 items-center"
      >
        <div className="fade-element">
          <h3 className="text-2xl font-semibold mb-3">24/7 Verfügbarkeit.</h3>
          <p className="text-gray-600 leading-relaxed text-justify hyphens-auto">
            Ein KI-gestützter Chatbot beantwortet zu jeder Zeit organisatorische und
            studienbezogene Fragen.
          </p>
        </div>

        <div className="fade-element fade-delay-1 bg-gray-200 rounded-2xl aspect-square flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
        </div>
      </section>

      {/* USE CASE SECTION */}
      <section className="bg-gray-50 py-32 px-8">
        <h2 className="fade-element text-3xl md:text-4xl font-bold text-center mb-20">
          So setzen Hochschulen und Studierende UNIAGENT ein
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">

          {/* Card 1 */}
          <div className="fade-element fade-delay-1 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.6A7.3 7.3 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold mb-4">
                Organisatorische Fragen sofort klären
              </h3>

              <p className="text-gray-700 leading-relaxed text-justify hyphens-auto">
                Studierende erhalten rund um die Uhr präzise Antworten zu Rückmeldung,
                Bewerbung, Fristen und Verwaltungsabläufen, ohne lange Wartezeiten.
              </p>
            </div>

            <p className="mt-6 italic text-gray-500 text-justify hyphens-auto">
              Direkter Zugang zu wichtigen Informationen.
            </p>
          </div>

          {/* Card 2 */}
          <div className="fade-element fade-delay-2 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold mb-4">
                Anfragen intelligent zuordnen
              </h3>

              <p className="text-gray-700 leading-relaxed text-justify hyphens-auto">
                UNIAGENT erkennt automatisch die Kategorie jeder Anfrage und entscheidet,
                ob sie beantwortet oder an den Support weitergeleitet wird.
              </p>
            </div>

            <p className="mt-6 italic text-gray-500 text-justify hyphens-auto">
              Manuelle Arbeit reduzieren.
            </p>
          </div>

          {/* Card 3 */}
          <div className="fade-element fade-delay-3 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 17v-6m4 6V7m4 10V3" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold mb-4">
                Dashboard für den Überblick
              </h3>

              <p className="text-gray-700 leading-relaxed text-justify hyphens-auto">
                Support-Mitarbeitende sehen, wie viele Anfragen eingehen, wie viele automatisch
                beantwortet wurden und welche noch offen sind.
              </p>
            </div>

            <p className="mt-6 italic text-gray-500 text-justify hyphens-auto">
              Transparenz in Echtzeit.
            </p>
          </div>

        </div>
      </section>

    </LandingLayout>
  );
}

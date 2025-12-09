// src/pages/NuetzlicheLinks.jsx
import React, { useEffect } from "react";
import "../styles/scrollAnimations.css";

export default function NützlicheLinks() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-element");
    elements.forEach((el) => el.classList.remove("visible"));

    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 30);

    return () => clearTimeout(timeout);
  }, []);

  const links = [
    {
      title: "Bibliothek",
      description:
        "Zugriff auf die Hochschulbibliothek, Kataloge, Ausleihen und wissenschaftliche Ressourcen.",
      href: "https://www.w-hs.de/bibliothek/",
      accent: "from-[#A3E635] to-[#4CAF50]",
      arrowColor: "#4CAF50",
    },
    {
      title: "eduroam / WLAN",
      description:
        "Anleitungen zur Einrichtung von eduroam und Informationen zum Campus-WLAN.",
      href: "https://wiki.w-hs.de/wlan",
      accent: "from-[#7C3AED] to-[#6366F1]",
      arrowColor: "#6366F1",
    },
    {
      title: "Prüfungsämter",
      description:
        "Informationen zu Prüfungsanmeldung, Fristen und zuständigen Prüfungsämtern.",
      href: "https://www.w-hs.de/pruefungsaemter/",
      accent: "from-[#06B6D4] to-[#3B82F6]",
      arrowColor: "#3B82F6",
    },
    {
      title: "Campusportal",
      description:
        "Zentrale Plattform für Studienorganisation, Rückmeldung und Bescheinigungen.",
      href: "https://campus.w-hs.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces",
      accent: "from-[#F97316] to-[#EC4899]",
      arrowColor: "#F97316",
    },
    {
      title: "QIS Portal",
      description:
        "Verwaltung von Prüfungsanmeldungen, Notenübersicht und Leistungsnachweisen.",
      href: "https://qis.w-hs.de/qisserver/rds?state=user&type=0",
      accent: "from-[#22C55E] to-[#16A34A]",
      arrowColor: "#22C55E",
    },
    {
      title: "Studmail",
      description:
        "Zugriff auf deine studentische E-Mail-Adresse und wichtige Hochschulkommunikation.",
      href: "https://studmail.w-hs.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fstudmail.w-hs.de%2fowa%2f",
      accent: "from-[#0EA5E9] to-[#2563EB]",
      arrowColor: "#0EA5E9",
    },
  ];

  return (
    <div className="w-full h-full px-4 pt-6 pb-10 md:px-10">
      {/* Header */}
      <div className="fade-element mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Nützliche Links
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          Schneller Zugriff auf deine wichtigsten Links.
        </p>
      </div>

      {/* Link-Cards – kompakte Version der Dashboard-Karten */}
      <div className="fade-element max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden"
          >
            {/* Farbiger Header – kompakt */}
            <div
              className={`h-16 bg-gradient-to-tr ${link.accent} flex items-center justify-center`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]">
                  link 
                </span>
              </div>
            </div>

            {/* Inhalt – kürzer als Dashboard-Karten */}
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  {link.title}
                </h2>
                <p className="mt-1 text-xs md:text-sm text-gray-600 leading-relaxed">
                  {link.description}
                </p>
              </div>

              {/* Pfeil rechts */}
              <div className="mt-1">
                <span
                  className="material-symbols-outlined text-[18px] md:text-[20px] transition-colors"
                  style={{
                    color: link.arrowColor,
                  }}
                >
                  arrow_forward
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

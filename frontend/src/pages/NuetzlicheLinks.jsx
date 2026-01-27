// src/pages/NuetzlicheLinks.jsx
import React, { useEffect } from "react";
import "../styles/scrollAnimations.css";

export default function NuetzlicheLinks() {
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
      icon: "local_library",
      // neue Palette (nicht Dashboard)
      accent: "from-[#10B981] to-[#84CC16]", // emerald -> lime
    },
    {
      title: "eduroam / WLAN",
      description:
        "Anleitungen zur Einrichtung von eduroam und Informationen zum Campus-WLAN.",
      href: "https://wiki.w-hs.de/wlan",
      icon: "wifi",
      accent: "from-[#6366F1] to-[#A855F7]", // indigo -> purple
    },
    {
      title: "Prüfungsämter",
      description:
        "Informationen zu Prüfungsanmeldung, Fristen und zuständigen Prüfungsämtern.",
      href: "https://www.w-hs.de/pruefungsaemter/",
      icon: "gavel",
      accent: "from-[#F59E0B] to-[#FB7185]", // amber -> rose
    },
    {
      title: "Campusportal",
      description:
        "Zentrale Plattform für Studienorganisation, Rückmeldung und Bescheinigungen.",
      href: "https://campus.w-hs.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces",
      icon: "apps",
      accent: "from-[#EC4899] to-[#8B5CF6]", // pink -> violet
    },
    {
      title: "QIS Portal",
      description:
        "Verwaltung von Prüfungsanmeldungen, Notenübersicht und Leistungsnachweisen.",
      href: "https://qis.w-hs.de/qisserver/rds?state=user&type=0",
      icon: "insights",
      accent: "from-[#06B6D4] to-[#14B8A6]", // cyan -> teal
    },
    {
      title: "Studmail",
      description:
        "Zugriff auf deine studentische E-Mail-Adresse und wichtige Hochschulkommunikation.",
      href: "https://studmail.w-hs.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fstudmail.w-hs.de%2fowa%2f",
      icon: "mail",
      accent: "from-[#0EA5E9] to-[#1D4ED8]", // sky -> blue
    },
  ];

  return (
    <div className="w-full h-full px-4 pt-6 pb-10 md:px-10">
      {/* Header */}
      <div className="fade-element mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Nützliche Links
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          Schneller Zugriff auf wichtige Seiten und Portale.
        </p>
      </div>

      {/* Alle Links – linksbündig direkt unter Header */}
      <div className="fade-element w-full">
        <div className="rounded-3xl bg-white/85 border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="px-5 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Alle Links</div>
            <div className="text-xs text-gray-500">{links.length} Einträge</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-200">
            {links.map((l) => (
              <a
                key={l.title}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 px-5 md:px-6 py-4 hover:bg-white transition
                           focus:outline-none focus:ring-2 focus:ring-gray-900/15"
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 w-11 h-11 rounded-2xl bg-gradient-to-tr ${l.accent} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-white text-[22px]">
                    {l.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-base font-semibold text-gray-900">
                    {l.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 leading-relaxed">
                    {l.description}
                  </div>
                </div>

                {/* Arrow (ruhig, einheitlich) */}
                <div className="shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[22px] text-gray-300 transition-all group-hover:text-gray-700 group-hover:translate-x-1">
                    chevron_right
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
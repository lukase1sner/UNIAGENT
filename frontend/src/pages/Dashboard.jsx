import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scrollAnimations.css";

export default function Dashboard() {
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [hoveredCard, setHoveredCard] = useState(null); // für Pfeilfarbe pro Karte
  const navigate = useNavigate();

  // Fade-In Animation beim ersten Laden und bei Wechsel Grid/Liste
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-element");

    // Sichtbarkeit zurücksetzen
    elements.forEach((el) => el.classList.remove("visible"));

    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 30);

    return () => clearTimeout(timeout);
  }, [view]);

  const cards = [
    {
      id: "faq",
      title: "Häufig gestellte Fragen",
      description: "Erhalte Informationen zu häufig auftretenden Fragen.",
      icon: "question_exchange",
      accent: "from-[#A3E635] to-[#4CAF50]",
      arrowColor: "#4CAF50",
    },
    {
      id: "links",
      title: "Nützliche Links",
      description: "Schneller Zugriff auf wichtige Seiten und Portale.",
      icon: "link",
      accent: "from-[#7C3AED] to-[#6366F1]",
      arrowColor: "#6366F1",
    },
    {
      id: "chatbot",
      title: "Chatbot fragen",
      description: "Stell UNIAGENT deine studienbezogenen Fragen.",
      icon: "chat",
      accent: "from-[#06B6D4] to-[#3B82F6]",
      arrowColor: "#3B82F6",
    },
    {
      id: "me",
      title: "Mein Bereich",
      description: "Personenbezogene Angaben einsehen.",
      icon: "person",
      accent: "from-[#F97316] to-[#EC4899]",
      arrowColor: "#EC4899",
    },
  ];

  const isGrid = view === "grid";

  const getDelayClass = (index) => {
    if (index === 1) return "fade-delay-1";
    if (index === 2) return "fade-delay-2";
    if (index === 3) return "fade-delay-3";
    return "";
  };

  // Navigation für Karten-Pfeil
  const handleCardClick = (id) => {
    switch (id) {
      case "chatbot":
        navigate("/chat-start");
        break;
      case "links":
        navigate("/nuetzliche-links");
        break;
      case "me":
        navigate("/mein-bereich"); // ✅ NEU
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full h-full px-4 pt-4 pb-6 md:px-8 md:pt-4 md:pb-8">
      {/* Headerzeile im Inhalt – mit Fade */}
      <div className="fade-element flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Schneller Zugriff auf deine wichtigsten Bereiche.
          </p>
        </div>

        {/* View Switch: Grid / Liste – nur auf lg+ sichtbar */}
        <div className="hidden lg:inline-flex items-center rounded-full bg-white/90 border border-gray-200 shadow-sm px-1 py-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={isGrid}
            className={
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm transition cursor-pointer " +
              (isGrid
                ? "bg-[#E4ECD9] text-gray-900 font-medium"
                : "text-gray-600 hover:bg-[#E4ECD9]/70 hover:text-gray-900")
            }
          >
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">
              grid_view
            </span>
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={!isGrid}
            className={
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm transition cursor-pointer " +
              (!isGrid
                ? "bg-[#E4ECD9] text-gray-900 font-medium"
                : "text-gray-600 hover:bg-[#E4ECD9]/70 hover:text-gray-900")
            }
          >
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">
              list
            </span>
            <span className="hidden sm:inline">Liste</span>
          </button>
        </div>
      </div>

      {/* DESKTOP (lg+): Grid / Liste Umschaltung */}
      <div className="hidden lg:block">
        {isGrid ? (
          // GRID: 2x2 Karten – mit Fade-In + Delays
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={
                  "fade-element " +
                  getDelayClass(index) +
                  " group flex flex-col rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden"
                }
              >
                {/* Bunte Headerfläche */}
                <div
                  className={`h-28 md:h-32 w-full bg-gradient-to-tr ${card.accent} flex items-center justify-center`}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[30px] md:text-[34px] text-white">
                      {card.icon}
                    </span>
                  </div>
                </div>

                {/* Textbereich */}
                <div className="p-5 md:p-6 flex flex-col gap-3 flex-1">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Pfeil mit Kartenfarbe bei Hover */}
                  <div className="mt-2 flex justify-end items-center">
                    <button
                      type="button"
                      onClick={() => handleCardClick(card.id)}
                      className="inline-flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className="material-symbols-outlined text-[20px] transition-colors"
                        style={{
                          color:
                            hoveredCard === card.id
                              ? card.arrowColor
                              : "#D1D5DB",
                        }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // LISTENANSICHT – mit Fade-In + Delays
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={
                  "fade-element " +
                  getDelayClass(index) +
                  " group flex items-center justify-between gap-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition px-4 py-4 md:px-6"
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr ${card.accent} flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-[22px] md:text-[24px] text-white">
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-gray-900">
                      {card.title}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className="inline-flex items-center justify-center cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-[18px] md:text-[20px] transition-colors"
                    style={{
                      color:
                        hoveredCard === card.id ? card.arrowColor : "#D1D5DB",
                    }}
                  >
                    arrow_forward
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE + TABLET (<lg): immer Grid-Karten untereinander, Pfeile direkt farbig */}
      <div className="lg:hidden space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={
              "fade-element " +
              getDelayClass(index) +
              " group flex flex-col rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden"
            }
          >
            {/* Bunte Headerfläche */}
            <div
              className={`h-28 w-full bg-gradient-to-tr ${card.accent} flex items-center justify-center`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px] text-white">
                  {card.icon}
                </span>
              </div>
            </div>

            {/* Textbereich */}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h2 className="text-base font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {card.description}
              </p>

              {/* Pfeil: auf Mobile/Tablet IMMER in Kartenfarbe */}
              <div className="mt-2 flex justify-end items-center">
                <button
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className="inline-flex items-center justify-center cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-[20px] transition-colors"
                    style={{
                      color: card.arrowColor,
                    }}
                  >
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// src/pages/Dashboard.jsx
import React, { useRef, useState, useEffect } from "react";

const CARDS = [
  { id: 1, title: "Häufig gestellte Fragen", color: "bg-sky-100 text-sky-700" },
  { id: 2, title: "Nützliche Links", color: "bg-teal-100 text-teal-700" },
  { id: 3, title: "Chatbot fragen", color: "bg-purple-100 text-purple-700" },
  { id: 4, title: "Mein Bereich", color: "bg-amber-100 text-amber-700" },
];

export default function Dashboard() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardFullWidthRef = useRef(0);
  const scrollTimeout = useRef(null);
  const resizeObserverRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  const recalcSizes = () => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector("div[data-card-index='0']");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;

    const computed = window.getComputedStyle(container);
    const gapVal =
      computed.getPropertyValue("gap") ||
      computed.getPropertyValue("column-gap") ||
      "40px";
    const gap = parseFloat(gapVal) || 40;

    const cardFullWidth = cardWidth + gap;
    cardFullWidthRef.current = cardFullWidth;

    let sbWidth = 0;
    try {
      const root = document.documentElement;
      const cssVar = getComputedStyle(root)
        .getPropertyValue("--sidebar-width")
        ?.trim();
      if (cssVar) sbWidth = parseFloat(cssVar) || 0;
    } catch (e) {
      sbWidth = 0;
    }

    if (!sbWidth) {
      const aside = document.querySelector("aside");
      sbWidth = aside ? aside.offsetWidth : 0;
    }

    setSidebarWidth(sbWidth);

    const viewportWidth = window.innerWidth;
    const viewportCenter = viewportWidth / 2;

    const leftPad = Math.max(
      0,
      viewportCenter - cardWidth / 2 - sbWidth
    );
    const rightPad = Math.max(
      0,
      viewportCenter - cardWidth / 2
    );

    container.style.paddingLeft = `${leftPad}px`;
    container.style.paddingRight = `${rightPad}px`;
  };

  useEffect(() => {
    recalcSizes();

    const onResize = () => recalcSizes();
    window.addEventListener("resize", onResize);

    try {
      const aside = document.querySelector("aside");
      if (aside && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => recalcSizes());
        resizeObserverRef.current.observe(aside);
      }
    } catch (e) {}

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, []);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const cardFullWidth = cardFullWidthRef.current || 460;

    const index = Math.round(container.scrollLeft / cardFullWidth);
    setActiveIndex(Math.max(0, Math.min(CARDS.length - 1, index)));

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => snapToNearest(), 120);
  };

  const snapToNearest = () => {
    const container = scrollRef.current;
    if (!container) return;
    const cardFullWidth = cardFullWidthRef.current || 460;

    const index = Math.round(container.scrollLeft / cardFullWidth);
    const target = Math.max(0, Math.min(CARDS.length - 1, index));

    container.scrollTo({
      left: target * cardFullWidth,
      behavior: "smooth",
    });

    setActiveIndex(target);
  };

  const onCardClick = (i) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardFullWidth = cardFullWidthRef.current || 460;

    container.scrollTo({
      left: i * cardFullWidth,
      behavior: "smooth",
    });

    setActiveIndex(i);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      recalcSizes();
      const c = scrollRef.current;
      if (c) c.scrollTo({ left: 0 });
      setActiveIndex(0);
    }, 50);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full overflow-x-hidden relative">

      {/* Dashboard Titel — FIXED damit er zur ganzen Seite zentriert ist */}
      <h1
        className="text-3xl md:text-4xl font-bold mb-10 text-gray-800 text-center"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: "84px", // unter Header positionieren; falls du andere Header-Höhe hast, anpassen
          zIndex: 40,
        }}
      >
        Dashboard
      </h1>

      <div className="w-full pt-24">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-10 overflow-x-auto no-scrollbar px-0 py-10"
          role="list"
          aria-label="Dashboard cards"
        >
          {CARDS.map((card, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={card.id}
                data-card-index={index}
                onClick={() => onCardClick(index)}
                className={`
                  flex-shrink-0 w-[360px] md:w-[420px] h-[240px] md:h-[280px]
                  rounded-3xl flex items-center justify-center
                  transition-transform duration-300
                  ${card.color}
                `}
                style={{
                  transform: active ? "scale(1.12)" : "scale(0.92)",
                  opacity: active ? 1 : 0.75,
                  cursor: "pointer",
                  boxShadow: "none",
                }}
                role="listitem"
                aria-current={active ? "true" : "false"}
              >
                <p className="text-xl md:text-2xl font-semibold text-center px-6">
                  {card.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

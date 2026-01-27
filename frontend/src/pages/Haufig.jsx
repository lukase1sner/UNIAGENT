// src/pages/Haufig.jsx
import React, { useEffect, useState } from "react";
import "../styles/scrollAnimations.css";

export default function Haufig() {
  const [faqs, setFaqs] = useState([]); // { q, a, rank, count, lastAsked }
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Fade-In Animation
    const elements = document.querySelectorAll(".fade-element");
    elements.forEach((el) => el.classList.remove("visible"));

    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 30);

    const controller = new AbortController();

    const formatLastAsked = (value) => {
      try {
        if (!value) return "Unbekannt";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "Unbekannt";
        return d.toLocaleDateString("de-DE");
      } catch {
        return "Unbekannt";
      }
    };

    // ✅ TopFAQ Endpoint (liefert bei dir: [ { success:true, topQuestions:[...]} ])
    const TOPFAQ_URL = "https://bw13.app.n8n.cloud/webhook/api/top-faq";

    const normalizeTopFaqResponse = (raw) => {
      // ✅ wenn n8n ein Array liefert -> erstes Element nehmen
      const data = Array.isArray(raw) ? raw[0] : raw;

      if (data?.success && Array.isArray(data?.topQuestions)) {
        return data.topQuestions
          .map((item, index) => {
            const q = item?.question ?? item?.q ?? "";
            const answer = item?.answer ?? item?.a ?? "";

            const count =
              typeof item?.count === "number"
                ? item.count
                : Number.isFinite(Number(item?.count))
                ? Number(item.count)
                : null;

            const lastAsked = formatLastAsked(item?.lastAsked);

            // Meta-Text (unten an die Antwort)
            const metaParts = [];
            if (count !== null) metaParts.push(`🔥 ${count}x gefragt`);
            metaParts.push(`Zuletzt: ${lastAsked}`);
            const metaText = metaParts.join(" · ");

            return {
              q,
              a: answer ? `${answer}\n\n${metaText}` : `${metaText}\n\nAntwort laden…`,
              rank: index + 1,
              count,
              lastAsked,
            };
          })
          .filter((x) => x.q)
          .slice(0, 10);
      }

      return [];
    };

    const loadTopFaqs = async () => {
      try {
        const res = await fetch(TOPFAQ_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        const normalized = normalizeTopFaqResponse(raw);
        setFaqs(normalized);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("TopFAQ Fehler:", err);
          setFaqs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTopFaqs();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full h-full px-4 pt-8 pb-12 md:px-10">
      {/* Header */}
      <div className="fade-element text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Häufig gestellte Fragen
        </h1>

        <p className="mt-4 text-base md:text-lg font-semibold text-[#6D5EF8]">
          Top 10 Fragen und unsere Antworten
        </p>
      </div>

      {/* FAQ Container */}
      <div className="fade-element mt-10 max-w-5xl mx-auto">
        {loading && <p className="text-center text-gray-500">Lade FAQs...</p>}

        {!loading && faqs.length === 0 && (
          <p className="text-center text-gray-500">Keine FAQs verfügbar.</p>
        )}

        <div className="flex flex-col gap-5">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.q || idx}
                className="bg-white/90 border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 md:px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank #1 #2 ... */}
                    <div className="min-w-[44px] text-center">
                      <span className="text-2xl md:text-3xl font-extrabold text-[#667eea] leading-none">
                        #{item.rank}
                      </span>
                    </div>

                    <span className="text-base md:text-lg font-semibold text-gray-900">
                      {item.q}
                    </span>
                  </div>

                  <span
                    className={`material-symbols-outlined text-[22px] md:text-[24px] text-gray-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 pb-6" : "max-h-0"
                  }`}
                >
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
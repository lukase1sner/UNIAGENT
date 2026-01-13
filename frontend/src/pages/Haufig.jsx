// src/pages/Haufig.jsx
import React, { useEffect, useState } from "react";
import "../styles/scrollAnimations.css";

export default function Haufig() {
  const [faqs, setFaqs] = useState([]); // { q, a, rank, count, lastAsked, answerLoaded }
  const [totalQuestions, setTotalQuestions] = useState(null);
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

    // Production-TopFAQ via Vite-Proxy -> https://bw13.app.n8n.cloud/webhook/api/top-faq
    const TOPFAQ_URL = "/api/top-faq";

    const normalizeTopFaqResponse = (data) => {
      if (data?.success && Array.isArray(data?.topQuestions)) {
        const statsTotal = data?.statistics?.totalQuestions;
        setTotalQuestions(
          typeof statsTotal === "number"
            ? statsTotal
            : Number.isFinite(Number(statsTotal))
            ? Number(statsTotal)
            : null
        );

        return data.topQuestions
          .map((item, index) => {
            const q = item?.question ?? item?.q ?? "";
            const count =
              typeof item?.count === "number"
                ? item.count
                : Number.isFinite(Number(item?.count))
                ? Number(item.count)
                : null;

            const lastAsked = formatLastAsked(item?.lastAsked);

            // Starttext beim Aufklappen: Meta + Hinweis
            const metaParts = [];
            if (count !== null) metaParts.push(`🔥 ${count}x gefragt`);
            metaParts.push(`Zuletzt: ${lastAsked}`);

            return {
              q,
              a: `${metaParts.join(" · ")}\n\nAntwort laden…`,
              rank: index + 1,
              count,
              lastAsked,
              answerLoaded: false,
            };
          })
          .filter((x) => x.q)
          .slice(0, 10);
      }

      setTotalQuestions(null);
      return [];
    };

    const fetchJson = async (url) => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    };

    const loadTopFaqs = async () => {
      try {
        const data = await fetchJson(TOPFAQ_URL);
        const normalized = normalizeTopFaqResponse(data);
        setFaqs(normalized);
        setLoading(false);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("TopFAQ Fehler:", err);
        setFaqs([]);
        setTotalQuestions(null);
        setLoading(false);
      }
    };

    loadTopFaqs();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Holt die echte Antwort (FAQ) über deinen alten Webhook
  const fetchAnswerForQuestion = async (question) => {
    const OLD_FAQ_WEBHOOK =
      "https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat";

    const res = await fetch(OLD_FAQ_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Wichtig: wir schicken die Frage mit, damit n8n die passende Antwort geben kann
      body: JSON.stringify({ source: "faq", question }),
    });

    if (!res.ok) throw new Error(`FAQ HTTP ${res.status}`);

    const data = await res.json();

    // n8n kann unterschiedlich antworten:
    const payload = Array.isArray(data) ? data : data?.output ?? data;

    // Fall 1: Array mit FAQs -> passende finden
    if (Array.isArray(payload)) {
      const normalized = payload.map((x) => ({
        q: x?.q ?? x?.question ?? "",
        a: x?.a ?? x?.answer ?? "",
      }));

      const hit =
        normalized.find(
          (x) => x.q?.trim().toLowerCase() === question.trim().toLowerCase()
        ) || normalized[0];

      return hit?.a || "";
    }

    // Fall 2: einzelnes Objekt mit answer
    const a = payload?.a ?? payload?.answer ?? "";
    return a || "";
  };

  const toggle = async (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));

    // Wenn wir gerade öffnen und Antwort noch nicht geladen ist: nachladen
    const item = faqs[idx];
    const willOpen = openIndex !== idx;

    if (willOpen && item && !item.answerLoaded) {
      try {
        const answer = await fetchAnswerForQuestion(item.q);

        setFaqs((prev) =>
          prev.map((x, i) => {
            if (i !== idx) return x;

            const metaParts = [];
            if (x.count !== null && x.count !== undefined)
              metaParts.push(`🔥 ${x.count}x gefragt`);
            metaParts.push(`Zuletzt: ${x.lastAsked ?? "Unbekannt"}`);

            const metaText = metaParts.join(" · ");

            return {
              ...x,
              a: answer
                ? `${answer}\n\n${metaText}`
                : `Keine Antwort gefunden.\n\n${metaText}`,
              answerLoaded: true,
            };
          })
        );
      } catch (err) {
        console.error("Antwort laden Fehler:", err);
        setFaqs((prev) =>
          prev.map((x, i) =>
            i === idx
              ? {
                  ...x,
                  a: `Antwort konnte nicht geladen werden.\n\n🔥 ${
                    x.count ?? "—"
                  }x gefragt · Zuletzt: ${x.lastAsked ?? "Unbekannt"}`,
                  answerLoaded: true,
                }
              : x
          )
        );
      }
    }
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

      {/* Stats Box */}
      <div className="fade-element mt-8 max-w-5xl mx-auto">
        <div className="rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold leading-none">
                {totalQuestions ?? (loading ? "…" : "—")}
              </div>
              <div className="mt-2 text-sm md:text-base opacity-90 font-medium">
                Fragen gesamt
              </div>
            </div>
          </div>
        </div>
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
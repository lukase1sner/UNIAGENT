// src/pages/Haufig.jsx
import React, { useEffect, useState } from "react";
import "../styles/scrollAnimations.css";

export default function Haufig() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Fade-In Animation (wie vorher)
    const elements = document.querySelectorAll(".fade-element");
    elements.forEach((el) => el.classList.remove("visible"));

    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 30);

    // FAQs vom n8n Webhook laden
    fetch("https://bw13.app.n8n.cloud/webhook/b1a8fcf2-9b73-4f0b-b038-ffa30af05522/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "faq" }),
    })
      .then((res) => res.json())
      .then((data) => {
        // n8n kann unterschiedlich antworten:
        // - direkt Array: [{q,a}] oder [{question,answer}]
        // - oder Objekt mit output: { output: [...] } / { output: "..." }
        const payload = Array.isArray(data) ? data : data?.output ?? data;

        const normalized = (Array.isArray(payload) ? payload : []).map((x) => ({
          q: x?.q ?? x?.question ?? "",
          a: x?.a ?? x?.answer ?? "",
        }));

        setFaqs(normalized.filter((x) => x.q && x.a));
        setLoading(false);
      })
      .catch((err) => {
        console.error("FAQ Fehler:", err);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
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

        <p className="mt-4 text-sm md:text-base text-gray-600 font-medium">
          Eine gute Entscheidung mit UNIAGENT zu arbeiten –
        </p>

        <p className="mt-2 text-base md:text-lg font-semibold text-[#6D5EF8]">
          5 wichtige Fragen und unsere Antworten
        </p>
      </div>

      {/* FAQ Container */}
      <div className="fade-element mt-10 max-w-5xl mx-auto">
        {loading && <p className="text-center text-gray-500">Lade FAQs...</p>}

        {!loading && faqs.length === 0 && (
          <p className="text-center text-gray-500">
            Keine FAQs verfügbar (Webhook hat keine Liste zurückgegeben).
          </p>
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
                  <span className="text-base md:text-lg font-semibold text-gray-900">
                    {item.q}
                  </span>

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
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
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

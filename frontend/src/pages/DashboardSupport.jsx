import { useMemo, useState } from "react";

export default function DashboardSupport() {
  // -----------------------------
  // Hardcoded Tickets (Demo)
  // -----------------------------
  const initialTickets = useMemo(
    () => [
      {
        id: "T-2",
        subject: "Fehler bei Prüfungsanmeldung",
        question:
          "Ich habe mich für das Modul Datenbanken und Informationssysteme angemeldet. Die Anmeldung wird mir im Portal aber nicht angezeigt. Was kann ich da tun?",
        requesterName: "Natacha Megnegne",
        createdAt: "Heute, 10:12",
        status: "open",
      },
      {
        id: "T-1",
        subject: "Studierendenbescheinigung mit falschen Angaben",
        question:
          "In meiner Studierendenbescheinigung, die ich heruntergeladen habe, ist das aktuelle Semester falsch angegeben. Was kann ich jetzt machen?",
        requesterName: "Tim Meier",
        createdAt: "Gestern, 18:05",
        status: "answered",
      },
    ],
    []
  );

  const [tickets, setTickets] = useState(initialTickets);
  const [activeTab, setActiveTab] = useState("open"); // open | answered
  const [selectedId, setSelectedId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [flash, setFlash] = useState("");

  const filteredTickets = tickets.filter((t) => t.status === activeTab);
  const selected = tickets.find((t) => t.id === selectedId) || null;

  const counts = useMemo(() => {
    const total = tickets.length;
    const auto = 0;
    const manualOpen = tickets.filter((t) => t.status === "open").length;
    return { total, auto, manualOpen };
  }, [tickets]);

  const selectTicket = (id) => {
    setSelectedId(id);
    setAnswer("");
    setFlash("");
  };

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!selected || selected.status !== "open") return;

    if (!answer.trim()) {
      setFlash("Bitte zuerst eine Antwort eingeben.");
      return;
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id ? { ...t, status: "answered" } : t
      )
    );

    setFlash("Antwort gespeichert (Demo). Später per E-Mail versendet.");
    setAnswer("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-black">Support-Dashboard</h1>

      {/* KPI-Kacheln */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Eingegangene Anfragen</p>
          <p className="mt-2 text-3xl font-bold">{counts.total}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Automatisch beantwortet</p>
          <p className="mt-2 text-3xl font-bold">{counts.auto}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Manuell offen</p>
          <p className="mt-2 text-3xl font-bold">{counts.manualOpen}</p>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Liste + Tabs */}
        <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-1">
          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            {[
              { key: "open", label: "Offen" },
              { key: "answered", label: "Beantwortet" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedId(null);
                }}
                className={
                  "rounded-full px-4 py-1.5 text-sm transition " +
                  (activeTab === tab.key
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ticketliste */}
          <div className="space-y-2">
            {filteredTickets.length === 0 && (
              <p className="text-sm text-gray-500">
                Keine Tickets in diesem Bereich.
              </p>
            )}

            {filteredTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTicket(t.id)}
                className={
                  "w-full rounded-xl border px-3 py-3 text-left transition " +
                  (t.id === selectedId
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50")
                }
              >
                <div className="truncate text-sm font-semibold">
                  {t.subject}
                </div>
                <div className="mt-1 truncate text-xs text-gray-600">
                  {t.requesterName} • {t.createdAt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail + Antwort */}
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          {!selected ? (
            <p className="text-sm text-gray-600">
              Bitte wähle links eine Anfrage aus.
            </p>
          ) : (
            <>
              <div className="text-lg font-semibold">{selected.subject}</div>
              <div className="mt-1 text-xs text-gray-600">
                Ticket {selected.id} • {selected.requesterName} •{" "}
                {selected.createdAt}
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm">
                  {selected.question}
                </p>
              </div>

              <form onSubmit={submitAnswer} className="mt-5">
                <label className="text-xs font-semibold text-gray-700">
                  Antwort
                </label>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  disabled={selected.status !== "open"}
                  className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm disabled:bg-gray-50"
                  placeholder={
                    selected.status === "open"
                      ? "Antwort schreiben…"
                      : "Dieses Ticket wurde bereits beantwortet."
                  }
                />

                {flash && (
                  <div
                    className={
                      "mt-3 rounded-xl px-3 py-2 text-sm " +
                      (flash.includes("Bitte")
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700")
                    }
                  >
                    {flash}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={selected.status !== "open"}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Absenden
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
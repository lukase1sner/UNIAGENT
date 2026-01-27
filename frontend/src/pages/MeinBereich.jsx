// src/pages/MeinBereich.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MeinBereich() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveMsgIsError, setSaveMsgIsError] = useState(false);

  const [savePressed, setSavePressed] = useState(false);
  const [resetPressed, setResetPressed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uniagentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setFirstName(parsed?.firstName || "");
        setLastName(parsed?.lastName || "");
        setEmail(parsed?.email || "");
      }
    } catch (e) {
      console.warn("Konnte User nicht lesen:", e);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Vorname darf nicht leer sein.";
    if (!lastName.trim()) newErrors.lastName = "Nachname darf nicht leer sein.";
    if (!email.trim()) newErrors.email = "E-Mail darf nicht leer sein.";
    else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Ungültige E-Mail-Adresse.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      firstName !== (user.firstName || "") ||
      lastName !== (user.lastName || "") ||
      email !== (user.email || "")
    );
  }, [user, firstName, lastName, email]);

  const handleSave = async () => {
    setSaveMsg("");
    setSaveMsgIsError(false);
    if (!validate()) return;

    const token =
      user?.token ||
      user?.accessToken ||
      user?.access_token ||
      user?.jwt;

    if (!token) {
      setSaveMsgIsError(true);
      setSaveMsg("Nicht eingeloggt oder Token fehlt.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        setSaveMsgIsError(true);
        setSaveMsg(data?.message || "Speichern fehlgeschlagen.");
        return;
      }

      const updatedUser = {
        ...(user || {}),
        firstName: data?.firstName ?? firstName,
        lastName: data?.lastName ?? lastName,
        email: data?.email ?? email,
      };

      localStorage.setItem("uniagentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSaveMsg("Gespeichert ✓");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsgIsError(true);
      setSaveMsg("Serverfehler.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToPassword = () => {
    navigate("/password-aendern");
  };

  const InputField = ({ label, value, onChange, error, type = "text" }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div
        className={
          "rounded-2xl border shadow-sm transition overflow-hidden " +
          (error
            ? "border-red-300 bg-red-50/60"
            : "border-white/40 bg-white/55 backdrop-blur-md")
        }
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 text-sm bg-transparent outline-none text-gray-900"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );

  const Card = ({ title, children }) => (
    <div className="rounded-3xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-md">
      <div className="p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full px-4 pt-4 pb-6 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Mein Bereich
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Personenbezogene Angaben einsehen.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card title="Kontodaten">
          <div className="flex flex-col gap-4">
            <InputField label="Vorname" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} />
            <InputField label="Nachname" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} />
            <InputField label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!isSaving) handleSave();
                }}
                className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white/60 hover:bg-white/80 transition cursor-pointer"
              >
                {isSaving ? "Speichern…" : "Änderungen speichern"}
              </button>

              {saveMsg && (
                <span className={`text-sm font-semibold ${saveMsgIsError ? "text-red-700" : "text-green-700"}`}>
                  {saveMsg}
                </span>
              )}

              {isDirty && (
                <span className="text-xs text-gray-500">
                  Änderungen erkannt
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card title="Sicherheit">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              goToPassword();
            }}
            className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white/60 hover:bg-white/80 transition cursor-pointer"
          >
            Passwort zurücksetzen
          </button>
        </Card>
      </div>
    </div>
  );
}
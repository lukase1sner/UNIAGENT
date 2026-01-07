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
    console.log("SAVE CLICKED", { firstName, lastName, email, user });

    setSaveMsg("");
    setSaveMsgIsError(false);

    if (!validate()) return;

    // Must be logged in and have token
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
      console.log("PROFILE SAVE RESPONSE", res.status, data);

      if (!res.ok || data?.success === false) {
        setSaveMsgIsError(true);
        setSaveMsg(data?.message || "Speichern fehlgeschlagen.");
        return;
      }

      // Use server-confirmed values if present
      const updatedUser = {
        ...(user || {}),
        firstName: data?.firstName ?? firstName,
        lastName: data?.lastName ?? lastName,
        email: data?.email ?? email,
      };

      localStorage.setItem("uniagentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSaveMsgIsError(false);
      setSaveMsg("Gespeichert ✓");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (e) {
      console.warn("Profil-Update fehlgeschlagen:", e);
      setSaveMsgIsError(true);
      setSaveMsg("Serverfehler.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Navigation sofort auf PointerDown (stabiler als onClick bei deinem Layout)
  const goToPassword = () => {
    console.log("NAVIGATE -> /password-aendern");
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
          className={
            "w-full px-4 py-3 text-sm bg-transparent outline-none " +
            (error ? "text-red-900" : "text-gray-900")
          }
          placeholder={label}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );

  const Card = ({ title, subtitle, children, className = "" }) => {
    return (
      <div
        className={
          "rounded-3xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-md overflow-hidden " +
          className
        }
      >
        <div className="p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  };

  // IMPORTANT: Keep save clickable so we can always test the API call
  const saveDisabled = isSaving;

  return (
    <div className="w-full h-full px-4 pt-4 pb-6 md:px-8 md:pt-4 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Mein Bereich
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Personenbezogene Angaben einsehen.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Kontodaten */}
        <Card title="Kontodaten">
          <div className="flex flex-col gap-4">
            <InputField
              label="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
            />
            <InputField
              label="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
            <InputField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <button
                type="button"
                onPointerDown={(e) => {
                  // Prevent parent/overlay issues swallowing clicks
                  e.preventDefault();
                  e.stopPropagation();

                  console.log("SAVE POINTERDOWN");
                  setSavePressed(true);

                  if (!saveDisabled) handleSave();
                }}
                onPointerUp={() => setSavePressed(false)}
                onPointerCancel={() => setSavePressed(false)}
                onPointerLeave={() => setSavePressed(false)}
                disabled={saveDisabled}
                className={
                  "relative z-50 pointer-events-auto rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-150 select-none " +
                  (saveDisabled
                    ? "bg-white/50 text-gray-500 cursor-not-allowed"
                    : savePressed
                    ? "bg-black text-white"
                    : "bg-white/55 backdrop-blur-md text-gray-900 hover:bg-white/70 cursor-pointer active:bg-black active:text-white")
                }
              >
                {isSaving ? "Speichern…" : "Änderungen speichern"}
              </button>

              {saveMsg && (
                <span
                  className={
                    "text-sm font-semibold " +
                    (saveMsgIsError ? "text-red-700" : "text-green-700")
                  }
                >
                  {saveMsg}
                </span>
              )}

              <span className="text-xs text-gray-500">
                {isDirty ? "Änderungen erkannt" : "Keine Änderungen"}
              </span>
            </div>
          </div>
        </Card>

        {/* Passwort */}
        <Card title="Sicherheit" className="relative z-40">
          <button
            type="button"
            onPointerDown={(e) => {
              console.log("RESET POINTERDOWN");
              setResetPressed(true);
              e.preventDefault();
              goToPassword();
            }}
            onPointerUp={() => setResetPressed(false)}
            onPointerCancel={() => setResetPressed(false)}
            onPointerLeave={() => setResetPressed(false)}
            className={
              "relative z-50 pointer-events-auto rounded-full border border-white/50 bg-white/55 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-150 select-none " +
              (resetPressed
                ? "bg-black text-white border-black"
                : "hover:bg-white/70 cursor-pointer active:bg-black active:text-white active:border-black")
            }
          >
            Passwort zurücksetzen
          </button>
        </Card>
      </div>
    </div>
  );
}

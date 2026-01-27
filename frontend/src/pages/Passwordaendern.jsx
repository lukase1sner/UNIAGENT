// src/pages/Passwordaendern.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Passwordaendern() {
  const navigate = useNavigate();

  // Email aus localStorage (wie bei deinem Login)
  const emailFromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem("uniagentUser");
      if (!raw) return "";
      const user = JSON.parse(raw);
      return user?.email || "";
    } catch {
      return "";
    }
  }, []);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  // ---------- Validierung ----------

  const validateNewPassword = (value, emailValue) => {
    if (!value) return "Bitte ein neues Passwort eingeben.";

    if (value.length < 8) {
      return "Dein neues Passwort muss mindestens 8 Zeichen lang sein.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Dein neues Passwort muss mindestens einen Großbuchstaben enthalten.";
    }

    if (!/[0-9]/.test(value)) {
      return "Dein neues Passwort muss mindestens eine Zahl enthalten.";
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Dein neues Passwort muss mindestens ein Sonderzeichen enthalten.";
    }

    if (emailValue) {
      const localPart = emailValue.split("@")[0]?.toLowerCase();
      if (localPart && value.toLowerCase().includes(localPart)) {
        return "Dein neues Passwort darf keinen direkten Bezug zu deiner E-Mail-Adresse haben.";
      }
    }

    return "";
  };

  const validateConfirm = (value, pwValue) => {
    if (!value) return "Bitte bestätige dein neues Passwort.";
    if (value !== pwValue) return "Die Passwörter stimmen nicht überein.";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!oldPassword) newErrors.oldPassword = "Bitte dein aktuelles Passwort eingeben.";

    const pwError = validateNewPassword(newPassword, emailFromStorage);
    if (pwError) newErrors.newPassword = pwError;

    const confirmError = validateConfirm(newPassword2, newPassword);
    if (confirmError) newErrors.newPassword2 = confirmError;

    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword = "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "oldPassword") {
      setErrors((prev) => ({
        ...prev,
        oldPassword: oldPassword ? "" : "Bitte dein aktuelles Passwort eingeben.",
      }));
    }

    if (field === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        newPassword: validateNewPassword(newPassword, emailFromStorage),
      }));
    }

    if (field === "newPassword2") {
      setErrors((prev) => ({
        ...prev,
        newPassword2: validateConfirm(newPassword2, newPassword),
      }));
    }
  };

  // ---------- Submit / API-Call ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    // Optional aber sehr hilfreich: früh merken, falls ENV in Vercel fehlt
    if (!API_BASE_URL) {
      setServerError(
        "Konfiguration fehlt: VITE_API_BASE_URL ist nicht gesetzt. Bitte in Vercel (oder lokal .env) setzen."
      );
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailFromStorage, // falls Backend das braucht
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Change Password API Response:", data);

      if (!response.ok) {
        setServerError(
          data.message ||
            "Passwort konnte nicht geändert werden. Bitte prüfe deine Eingaben."
        );
      } else {
        setServerSuccess("Passwort erfolgreich geändert.");

        // optional: Formular leeren
        setOldPassword("");
        setNewPassword("");
        setNewPassword2("");
        setTouched({});
        setErrors({});

        // optional: zurück in den Bereich /dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setServerError(
        "Es ist ein technischer Fehler aufgetreten. Bitte versuche es später erneut."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[32px] bg-[#E4ECD9] px-8 py-10 md:px-10">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-black">
        Passwort ändern
      </h1>

      {emailFromStorage ? (
        <p className="mb-8 text-center text-xs text-[#111827]/80">
          Konto: <span className="font-semibold">{emailFromStorage}</span>
        </p>
      ) : (
        <p className="mb-8 text-center text-xs text-[#111827]/80">
          Konto: <span className="font-semibold">unbekannt</span>
        </p>
      )}

      {/* Server-Meldungen */}
      {serverError && (
        <div className="mb-4 rounded-full bg-red-100 px-4 py-2 text-center text-xs font-medium text-red-700">
          {serverError}
        </div>
      )}

      {serverSuccess && (
        <div className="mb-4 rounded-full bg-green-100 px-4 py-2 text-center text-xs font-medium text-green-700">
          {serverSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aktuelles Passwort */}
        <div>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (touched.oldPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    oldPassword: e.target.value
                      ? ""
                      : "Bitte dein aktuelles Passwort eingeben.",
                  }));
                }
              }}
              onBlur={() => handleBlur("oldPassword")}
              className={
                "w-full rounded-full border bg-gray-100 px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
                (errors.oldPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-[#98C73C]")
              }
              placeholder="Aktuelles Passwort *"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <span className="material-symbols-outlined text-[22px]">
                {showOldPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.oldPassword}</p>
          )}
        </div>

        {/* Neues Passwort */}
        <div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (touched.newPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    newPassword: validateNewPassword(
                      e.target.value,
                      emailFromStorage
                    ),
                  }));
                }
                // confirm ggf. live nachziehen
                if (touched.newPassword2) {
                  setErrors((prev) => ({
                    ...prev,
                    newPassword2: validateConfirm(newPassword2, e.target.value),
                  }));
                }
              }}
              onBlur={() => handleBlur("newPassword")}
              className={
                "w-full rounded-full border bg-gray-100 px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
                (errors.newPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-[#98C73C]")
              }
              placeholder="Neues Passwort *"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <span className="material-symbols-outlined text-[22px]">
                {showNewPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Neues Passwort bestätigen */}
        <div>
          <div className="relative">
            <input
              type={showNewPassword2 ? "text" : "password"}
              value={newPassword2}
              onChange={(e) => {
                setNewPassword2(e.target.value);
                if (touched.newPassword2) {
                  setErrors((prev) => ({
                    ...prev,
                    newPassword2: validateConfirm(e.target.value, newPassword),
                  }));
                }
              }}
              onBlur={() => handleBlur("newPassword2")}
              className={
                "w-full rounded-full border bg-gray-100 px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
                (errors.newPassword2
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-[#98C73C]")
              }
              placeholder="Neues Passwort bestätigen *"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword2((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <span className="material-symbols-outlined text-[22px]">
                {showNewPassword2 ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.newPassword2 && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword2}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-full bg-[#98C73C] py-3 text-sm font-semibold
                     text-black cursor-pointer transition-colors duration-150
                     active:bg-[#7DA32F]
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#98C73C] focus:ring-offset-2"
        >
          {isSubmitting ? "Wird gespeichert …" : "Passwort ändern"}
        </button>

        {/* Abbrechen */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full rounded-full bg-transparent py-3 text-sm font-semibold
                     text-black underline underline-offset-4 hover:no-underline"
        >
          Abbrechen
        </button>
      </form>
    </div>
  );
}
// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const navigate = useNavigate();

  // ---------- Validierung ----------

  const validateEmail = (value) => {
    if (!value) return "Bitte E-Mail-Adresse eingeben.";

    if (!value.includes("@")) {
      return "Deine E-Mail-Adresse muss ein @ Zeichen enthalten.";
    }

    const parts = value.split("@");
    if (parts.length !== 2 || !parts[1].includes(".")) {
      return "Deine E-Mail-Adresse muss eine Top-Level-Domain wie .com oder .de enthalten.";
    }

    const domainParts = parts[1].split(".");
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Deine E-Mail-Adresse muss eine Top-Level-Domain wie .com oder .de enthalten.";
    }

    return "";
  };

  const validatePassword = (value, emailValue) => {
    if (!value) return "Bitte ein Passwort eingeben.";

    if (value.length < 8) {
      return "Dein Passwort muss mindestens 8 Zeichen lang sein.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Dein Passwort muss mindestens einen Großbuchstaben enthalten.";
    }

    if (!/[0-9]/.test(value)) {
      return "Dein Passwort muss mindestens eine Zahl enthalten.";
    }

    // mind. ein Sonderzeichen
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Dein Passwort muss mindestens ein Sonderzeichen enthalten.";
    }

    if (emailValue) {
      const localPart = emailValue.split("@")[0].toLowerCase();
      if (localPart && value.toLowerCase().includes(localPart)) {
        return "Dein Passwort darf keinen direkten Bezug zu deiner E-Mail-Adresse haben.";
      }
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const pwError = validatePassword(password, email);
    if (pwError) newErrors.password = pwError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email),
      }));
    }
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password, email),
      }));
    }
  };

  // ---------- Submit / API-Call ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Login API Response:", data);

      if (!response.ok) {
        setServerError(
          data.message || "Anmeldung fehlgeschlagen. Bitte prüfe deine Eingaben."
        );
      } else {
        // 🔐 User-Daten aus Response möglichst robust extrahieren
        const firstNameFromApi =
          data.firstName ||
          data.first_name ||
          data.user?.firstName ||
          data.user?.first_name ||
          data.user_metadata?.first_name ||
          data.user?.user_metadata?.first_name ||
          "";

        const lastNameFromApi =
          data.lastName ||
          data.last_name ||
          data.user?.lastName ||
          data.user?.last_name ||
          data.user_metadata?.last_name ||
          data.user?.user_metadata?.last_name ||
          "";

        const emailFromApi =
          data.email ||
          data.user?.email ||
          data.user_metadata?.email ||
          data.user?.user_metadata?.email ||
          email;

        const userForStorage = {
          firstName: firstNameFromApi,
          lastName: lastNameFromApi,
          email: emailFromApi,
        };

        // immer speichern – notfalls nur mit Email
        localStorage.setItem("uniagentUser", JSON.stringify(userForStorage));

        setServerSuccess("Anmeldung erfolgreich. Du wirst weitergeleitet …");
        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
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
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-black">
        Anmelden
      </h1>

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
        {/* E-Mail */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                setErrors((prev) => ({
                  ...prev,
                  email: validateEmail(e.target.value),
                }));
              }
            }}
            onBlur={() => handleBlur("email")}
            className={
              "w-full rounded-full border bg-gray-100 px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
              (errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-transparent focus:border-[#98C73C]")
            }
            placeholder="E-Mail *"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Passwort */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setErrors((prev) => ({
                    ...prev,
                    password: validatePassword(e.target.value, email),
                  }));
                }
              }}
              onBlur={() => handleBlur("password")}
              className={
                "w-full rounded-full border bg-gray-100 px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
                (errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-[#98C73C]")
              }
              placeholder="Passwort *"
            />

            {/* Toggle Password Visibility */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <span className="material-symbols-outlined text-[22px]">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-full bg-[#98C73C] py-3 text-sm font-semibold
                     text-black cursor-pointer transition-colors duration-150
                     active:bg-[#7DA32F]
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[#98C73C] focus:ring-offset-2"
        >
          {isSubmitting ? "Wird geprüft …" : "Anmelden"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4 text-xs text-black">
        <div className="h-px flex-1 bg-black" />
        <span className="shrink-0">ODER</span>
        <div className="h-px flex-1 bg-black" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-black">
        Du hast noch kein Konto?{" "}
        <a href="/register" className="font-bold text-black hover:underline">
          Registrieren
        </a>
      </p>
    </div>
  );
}

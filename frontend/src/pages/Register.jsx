// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const navigate = useNavigate();

  // ---------- Validierung ----------

  const validateFirstName = (value) => {
    if (!value) return "Bitte Vornamen eingeben.";
    if (value.trim().length < 2)
      return "Dein Vorname muss mindestens 2 Zeichen lang sein.";
    return "";
  };

  const validateLastName = (value) => {
    if (!value) return "Bitte Nachnamen eingeben.";
    if (value.trim().length < 2)
      return "Dein Nachname muss mindestens 2 Zeichen lang sein.";
    return "";
  };

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

  const validatePassword = (
    value,
    emailValue,
    firstNameValue,
    lastNameValue
  ) => {
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

    // mind. ein Sonderzeichen (alles, was kein Buchstabe/Zahl ist)
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Dein Passwort muss mindestens ein Sonderzeichen enthalten.";
    }

    const lower = value.toLowerCase();

    if (emailValue) {
      const localPart = emailValue.split("@")[0].toLowerCase();
      if (localPart && lower.includes(localPart)) {
        return "Dein Passwort darf keinen direkten Bezug zu deiner E-Mail-Adresse haben.";
      }
    }

    if (firstNameValue && lower.includes(firstNameValue.trim().toLowerCase())) {
      return "Dein Passwort sollte deinen Vornamen nicht enthalten.";
    }

    if (lastNameValue && lower.includes(lastNameValue.trim().toLowerCase())) {
      return "Dein Passwort sollte deinen Nachnamen nicht enthalten.";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    const fnError = validateFirstName(firstName);
    if (fnError) newErrors.firstName = fnError;

    const lnError = validateLastName(lastName);
    if (lnError) newErrors.lastName = lnError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const pwError = validatePassword(password, email, firstName, lastName);
    if (pwError) newErrors.password = pwError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "firstName") {
      setErrors((prev) => ({
        ...prev,
        firstName: validateFirstName(firstName),
      }));
    }
    if (field === "lastName") {
      setErrors((prev) => ({
        ...prev,
        lastName: validateLastName(lastName),
      }));
    }
    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email),
      }));
    }
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password, email, firstName, lastName),
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
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setServerError(
          data.message ||
            "Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben."
        );
      } else {
        setServerSuccess(
          "Registrierung erfolgreich. Du wirst zum Login weitergeleitet …"
        );
        setTimeout(() => {
          navigate("/login");
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
        Registrieren
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
        {/* Vorname */}
        <div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (touched.firstName) {
                setErrors((prev) => ({
                  ...prev,
                  firstName: validateFirstName(e.target.value),
                }));
              }
            }}
            onBlur={() => handleBlur("firstName")}
            className={
              "w-full rounded-full border bg-gray-100 px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
              (errors.firstName
                ? "border-red-500 focus:border-red-500"
                : "border-transparent focus:border-[#98C73C]")
            }
            placeholder="Vorname *"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Nachname */}
        <div>
          <input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (touched.lastName) {
                setErrors((prev) => ({
                  ...prev,
                  lastName: validateLastName(e.target.value),
                }));
              }
            }}
            onBlur={() => handleBlur("lastName")}
            className={
              "w-full rounded-full border bg-gray-100 px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500 focus:outline-none " +
              (errors.lastName
                ? "border-red-500 focus:border-red-500"
                : "border-transparent focus:border-[#98C73C]")
            }
            placeholder="Nachname *"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>

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
                    password: validatePassword(
                      e.target.value,
                      email,
                      firstName,
                      lastName
                    ),
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

            {/* Google Visibility Icons */}
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
          {isSubmitting ? "Wird geprüft …" : "Registrieren"}
        </button>
      </form>

      {/* Divider – schwarz */}
      <div className="my-6 flex items-center gap-4 text-xs text-black">
        <div className="h-px flex-1 bg-black" />
        <span className="shrink-0">ODER</span>
        <div className="h-px flex-1 bg-black" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-black">
        Du hast ein Konto?{" "}
        <a href="/login" className="font-bold text-black hover:underline">
          Anmelden
        </a>
      </p>
    </div>
  );
}

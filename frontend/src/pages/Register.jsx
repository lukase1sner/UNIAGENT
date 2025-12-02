// src/pages/Register.jsx
import { useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-md rounded-[32px] bg-white px-8 py-10 shadow-xl shadow-[#98C73C90] md:px-10">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-black">
        Registrieren
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Vorname */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#4B5563]">
            Vorname <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            required
            className="w-full rounded-full border border-transparent bg-[#E7F7D4]
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="Vorname"
          />
        </div>

        {/* Nachname */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#4B5563]">
            Nachname <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            required
            className="w-full rounded-full border border-transparent bg-[#E7F7D4]
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="Nachname"
          />
        </div>

        {/* E-Mail */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#4B5563]">
            E-Mail <span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            required
            className="w-full rounded-full border border-transparent bg-[#E7F7D4]
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="E-Mail"
          />
        </div>

        {/* Passwort */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#4B5563]">
            Passwort <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-full border border-transparent bg-[#E7F7D4]
                         px-4 py-3 pr-10 text-sm text-[#1F2937] placeholder:text-gray-500
                         focus:outline-none focus:border-[#98C73C]"
              placeholder="Passwort"
            />

            {/* Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[#4B5563] hover:text-[#1F2937]"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-[#98C73C] py-3 text-sm font-semibold
                     text-white shadow-md shadow-[#98C73C90] hover:bg-[#7DA32F]"
        >
          Registrieren
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="shrink-0">ODER</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-700">
        Hast du ein Konto?{" "}
        <a
          href="/login"
          className="font-medium text-[#98C73C] hover:text-[#7DA32F]"
        >
          Anmelden
        </a>
      </p>
    </div>
  );
}

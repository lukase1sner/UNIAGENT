import { useState } from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-md rounded-[32px] bg-[#E4ECD9] px-8 py-10 md:px-10">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-black">
        Registrieren
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Vorname */}
        <div>
          <input
            type="text"
            required
            className="w-full rounded-full border border-transparent bg-gray-100
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="Vorname *"
          />
        </div>

        {/* Nachname */}
        <div>
          <input
            type="text"
            required
            className="w-full rounded-full border border-transparent bg-gray-100
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="Nachname *"
          />
        </div>

        {/* E-Mail */}
        <div>
          <input
            type="email"
            required
            className="w-full rounded-full border border-transparent bg-gray-100
                       px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-500
                       focus:outline-none focus:border-[#98C73C]"
            placeholder="E-Mail *"
          />
        </div>

        {/* Passwort */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-full border border-transparent bg-gray-100
                         px-4 py-3 pr-12 text-sm text-[#1F2937] placeholder:text-gray-500
                         focus:outline-none focus:border-[#98C73C]"
              placeholder="Passwort *"
            />

            {/* Google Visibility Icons – FIXED */}
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-[#98C73C] py-3 text-sm font-semibold
                     text-black cursor-pointer transition-colors duration-150
                     active:bg-[#7DA32F]
                     focus:outline-none focus:ring-2 focus:ring-[#98C73C] focus:ring-offset-2"
        >
          Registrieren
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
        <a
          href="/login"
          className="font-bold text-black hover:underline"
        >
          Anmelden
        </a>
      </p>
    </div>
  );
}

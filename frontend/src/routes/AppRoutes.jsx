import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing.jsx";

/* Chatbot */
import ChatbotLayout from "../layouts/ChatbotLayout.jsx";
import Chatbot from "../pages/Chatbot.jsx";

import ChatbotStartLayout from "../layouts/ChatbotStartLayout.jsx";
import ChatbotStart from "../pages/ChatbotStart.jsx";

/* Anwender-Dashboard */
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

/* Mein Bereich (NEU) */
import MeinBereichLayout from "../layouts/MeinBereichLayout.jsx";
import MeinBereich from "../pages/MeinBereich.jsx";

/* Support-Dashboard */
import DashboardSupportLayout from "../layouts/DashboardSupportLayout.jsx";
import DashboardSupport from "../pages/DashboardSupport.jsx";

/* Auth */
import RegisterLayout from "../layouts/RegisterLayout.jsx";
import Register from "../pages/Register.jsx";

import LoginLayout from "../layouts/LoginLayout.jsx";
import Login from "../pages/Login.jsx";

/* Nützliche Links */
import NützlicheLinksLayout from "../layouts/NuetzlicheLinksLayout.jsx";
import NützlicheLinks from "../pages/NuetzlicheLinks.jsx";

import PasswordaendernLayout from "../layouts/PasswordaendernLayout.jsx";
import Passwordaendern from "../pages/Passwordaendern.jsx";




export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏠 Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* 🟩 Chatbot Startscreen */}
      <Route path="/chat-start" element={<ChatbotStartLayout />}>
        <Route index element={<ChatbotStart />} />
      </Route>

      {/* 💬 Chatbot */}
      <Route path="/chat" element={<ChatbotLayout />}>
        <Route index element={<Chatbot />} />
      </Route>

      {/* 📊 Anwender-Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* 👤 Mein Bereich (NEU) */}
      <Route path="/mein-bereich" element={<MeinBereichLayout />}>
        <Route index element={<MeinBereich />} />
      </Route>

      {/* 🛠️ Support-Dashboard */}
      <Route path="/support" element={<DashboardSupportLayout />}>
        <Route index element={<DashboardSupport />} />
      </Route>

      {/* 📝 Registrierung */}
      <Route path="/register" element={<RegisterLayout />}>
        <Route index element={<Register />} />
      </Route>

      {/* 🔐 Login */}
      <Route path="/login" element={<LoginLayout />}>
        <Route index element={<Login />} />
      </Route>

      {/* 🔗 Nützliche Links */}
      <Route path="/nuetzliche-links" element={<NützlicheLinksLayout />}>
        <Route index element={<NützlicheLinks />} />
      </Route>

    {/* 🔐 Passwort ändern */}
<Route path="/password-aendern" element={<PasswordaendernLayout />}>
  <Route index element={<Passwordaendern />} />
</Route>

    

    </Routes>
  );
}
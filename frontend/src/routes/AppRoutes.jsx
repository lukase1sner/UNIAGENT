import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing.jsx";

import ChatbotLayout from "../layouts/ChatbotLayout.jsx";
import Chatbot from "../pages/Chatbot.jsx";

import ChatbotStartLayout from "../layouts/ChatbotStartLayout.jsx";
import ChatbotStart from "../pages/ChatbotStart.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import MeinBereichLayout from "../layouts/MeinBereichLayout.jsx";
import MeinBereich from "../pages/MeinBereich.jsx";

import DashboardSupportLayout from "../layouts/DashboardSupportLayout.jsx";
import DashboardSupport from "../pages/DashboardSupport.jsx";

import RegisterLayout from "../layouts/RegisterLayout.jsx";
import Register from "../pages/Register.jsx";

import LoginLayout from "../layouts/LoginLayout.jsx";
import Login from "../pages/Login.jsx";

import NützlicheLinksLayout from "../layouts/NuetzlicheLinksLayout.jsx";
import NützlicheLinks from "../pages/NuetzlicheLinks.jsx";

import PasswordaendernLayout from "../layouts/PasswordaendernLayout.jsx";
import Passwordaendern from "../pages/Passwordaendern.jsx";

import HaufigLayout from "../layouts/HaufigLayout.jsx";
import Haufig from "../pages/Haufig.jsx";





export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/chat-start" element={<ChatbotStartLayout />}>
        <Route index element={<ChatbotStart />} />
      </Route>

      <Route path="/chat" element={<ChatbotLayout />}>
        <Route index element={<Chatbot />} />
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      <Route path="/mein-bereich" element={<MeinBereichLayout />}>
        <Route index element={<MeinBereich />} />
      </Route>

      <Route path="/support" element={<DashboardSupportLayout />}>
        <Route index element={<DashboardSupport />} />
      </Route>

      <Route path="/register" element={<RegisterLayout />}>
        <Route index element={<Register />} />
      </Route>

      <Route path="/login" element={<LoginLayout />}>
        <Route index element={<Login />} />
      </Route>

      <Route path="/nuetzliche-links" element={<NützlicheLinksLayout />}>
        <Route index element={<NützlicheLinks />} />
      </Route>

      <Route path="/password-aendern" element={<PasswordaendernLayout />}>
      <Route index element={<Passwordaendern />} />
      </Route>

      <Route path="/haufig" element={<HaufigLayout />}>
        <Route index element={<Haufig />} />
      </Route>

    

    </Routes>
  );
}
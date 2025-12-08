// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing.jsx";

import ChatbotLayout from "../layouts/ChatbotLayout.jsx";
import Chatbot from "../pages/Chatbot.jsx";

import ChatbotStartLayout from "../layouts/ChatbotStartLayout.jsx";
import ChatbotStart from "../pages/ChatbotStart.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import RegisterLayout from "../layouts/RegisterLayout.jsx";
import Register from "../pages/Register.jsx";

import LoginLayout from "../layouts/LoginLayout.jsx";
import Login from "../pages/Login.jsx";

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

      {/* 📊 Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* 📝 Registrierung */}
      <Route path="/register" element={<RegisterLayout />}>
        <Route index element={<Register />} />
      </Route>

      {/* 🔐 Login */}
      <Route path="/login" element={<LoginLayout />}>
        <Route index element={<Login />} />
      </Route>

    </Routes>
  );
}

import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing.jsx";

import ChatbotLayout from "../layouts/ChatbotLayout.jsx";
import Chatbot from "../pages/Chatbot.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import RegisterLayout from "../layouts/RegisterLayout.jsx";
import Register from "../pages/Register.jsx";

              

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Chatbot */}
      <Route path="/chat" element={<ChatbotLayout />}>
        <Route index element={<Chatbot />} />
      </Route>

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

       {/* Register */}
      <Route path="/register" element={<RegisterLayout />}>
        <Route index element={<Register />} />
      </Route>
    </Routes>
  );
}

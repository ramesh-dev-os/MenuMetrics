import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
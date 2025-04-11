import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import { FirestoreProvider } from './context/FirestoreContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import UserprofilePage from './pages/UserprofilePage';
import Feedback from './pages/Feedback';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RestaurantManagement from './pages/admin/RestaurantManagement';
import MenuManagement from './pages/admin/MenuManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/" />;
  }
  
  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/home" />;
  }
  
  return children;
};

const App = () => {
  console.log("Rendering App component");
  
  return (
    <AuthProvider>
      <FirestoreProvider>
        <div>
          <Routes>
            {/* Auth Routes */}
            <Route path='/' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            
            {/* User Routes - Protected */}
            <Route 
              path='/home' 
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/userprofile' 
              element={
                <ProtectedRoute>
                  <UserprofilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/feedback' 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - Protected with admin check */}
            <Route 
              path='/admin' 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/admin/users' 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/admin/restaurants' 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <RestaurantManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/admin/menus' 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <MenuManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/admin/feedback' 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <FeedbackManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </FirestoreProvider>
    </AuthProvider>
  );
};

export default App;
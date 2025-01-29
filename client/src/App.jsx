// eslint-disable-next-line no-unused-vars
import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PostDetailsPage from './pages/PostDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegistrationPage from './pages/auth/RegistrationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserStore from './store/UserStore';

const App = () => {
  const { isLogin } = UserStore();

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={isLogin() ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isLogin() ? <Navigate to="/" /> : <RegistrationPage />} />
      <Route path="/forgot-password" element={isLogin() ? <Navigate to="/" /> : <ForgotPasswordPage />} />
      <Route path="/otp-verification" element={isLogin() ? <Navigate to="/" /> : <OTPVerificationPage />} />
      <Route path="/reset-password" element={isLogin() ? <Navigate to="/" /> : <ResetPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/post/details/:postID" element={<ProtectedRoute><PostDetailsPage /></ProtectedRoute>} />
    </Routes>
    
    </BrowserRouter>
  )
}

export default App
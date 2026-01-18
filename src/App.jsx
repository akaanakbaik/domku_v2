import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import ApiDocs from './pages/ApiDocs'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/subdomain" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App

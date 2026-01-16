import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import ApiDocs from './pages/ApiDocs'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/subdomain" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/api" element={<ApiDocs />} />
      </Route>
    </Routes>
  )
}

export default App

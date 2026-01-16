import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ApiDocs from './pages/ApiDocs'
import Layout from './components/Layout'
import Loader from './components/Loader'

function App() {
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (loading) return <Loader />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/subdomain" element={<Dashboard />} />
        <Route path="/api" element={<ApiDocs />} />
      </Route>
    </Routes>
  )
}

export default App

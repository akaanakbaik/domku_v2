import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Loader from './components/Loader'

import Notifications from './pages/Notifications'
import AdminDashboard from './pages/AdminDashboard'
import AdminGuard from './components/AdminGuard' // Import Guard

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/Auth'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const ApiDocs = lazy(() => import('./pages/ApiDocs'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Layout = lazy(() => import('./components/Layout'))

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/subdomain" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            
            <Route path="/api" element={<ApiDocs />} />
            <Route path="/notifikasi" element={<Notifications />} />
            
            {/* RUTE RAHASIA ADMIN (DILINDUNGI GUARD) */}
            <Route 
              path="/k-control-panel-x9z" 
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              } 
            />
            
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

export default App

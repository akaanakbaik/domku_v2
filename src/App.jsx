import React, { Suspense, lazy, useState } from 'react'
import { Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import useSecurity from './hooks/useSecurity'
import GlobalPopup from './components/GlobalPopup'
import Sidebar from './components/Sidebar'
import Loader from './components/Loader'
import Footer from './components/Footer'
import { Menu, Mail, MailOpen } from 'lucide-react'

// --- Lazy Load Pages ---
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
const Notifications = lazy(() => import('./pages/Notifications'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

// --- Helper Components ---

const PrivateRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? <Outlet /> : <Navigate to="/auth" />
}

const MainLayout = () => {
  const { user, loading, refreshSession } = useAuth() // Get refreshSession too
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const currentPath = location.pathname
  const isNotifPage = currentPath === '/notifikasi'
  const isDashboard = currentPath === '/subdomain' || currentPath === '/'
  const showNotifBtn = user && (isDashboard || isNotifPage)

  if (loading) return <Loader />

  return (
    <div className="bg-[#0b0c10] min-h-screen text-slate-300 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col">
      <GlobalPopup />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      {/* Mobile Header */}
      <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-white/5 bg-[#0b0c10]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 font-bold text-white tracking-wide">
            <span className="text-blue-500">DOM</span>KU
          </div>
          <div className="flex items-center gap-3">
            {showNotifBtn && (
                <button 
                    onClick={() => navigate(isNotifPage ? '/subdomain' : '/notifikasi')} 
                    className={`p-2 rounded-lg transition-all ${isNotifPage ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                    {isNotifPage ? <MailOpen size={20}/> : <Mail size={20}/>}
                </button>
            )}
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white">
                <Menu size={24}/>
            </button>
          </div>
      </header>

      {/* Content Wrapper */}
      <div className="flex-1 md:pl-[280px] transition-all duration-300 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0">
            <Suspense fallback={<Loader />}>
                {/* PASSING CONTEXT HERE IS CRITICAL */}
                <Outlet context={{ user, refreshSession }} />
            </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  )
}

// --- App Routes Logic ---
const AppRoutes = () => {
  useSecurity() 

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/api" element={<ApiDocs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        {/* Private */}
        <Route element={<PrivateRoute />}>
            <Route path="/subdomain" element={<Dashboard />} />
            <Route path="/notifikasi" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/k-control-panel-x9z" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

// --- Root Component ---
const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
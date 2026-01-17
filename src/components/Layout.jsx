import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, LogIn } from 'lucide-react'
import Sidebar from './Sidebar'
import Loader from './Loader'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Dynamic Title Changer
  useEffect(() => {
    const path = location.pathname
    let title = 'Domku - Secure Subdomain Manager'
    
    if (path === '/auth') title = 'Masuk / Daftar - Domku'
    if (path === '/subdomain') title = 'Dashboard - Domku'
    if (path === '/settings') title = 'Pengaturan Akun - Domku'
    if (path === '/api') title = 'API Documentation - Domku'
    if (path === '/') title = 'Domku - Free Subdomain Service'
    
    document.title = title
  }, [location])

  // 2. Session Logic
  const refreshSession = useCallback(() => {
    try {
      const local = localStorage.getItem('domku_session')
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed && parsed.email && parsed.api_key) {
          setUser(parsed)
        } else {
          localStorage.removeItem('domku_session')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (e) {
      localStorage.removeItem('domku_session')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setIsChecking(true)
      refreshSession()
      await new Promise(r => setTimeout(r, 400))
      setIsChecking(false)
    }

    init()
    window.addEventListener('storage', refreshSession)
    window.addEventListener('session-update', refreshSession)
    return () => {
      window.removeEventListener('storage', refreshSession)
      window.removeEventListener('session-update', refreshSession)
    }
  }, [refreshSession])

  // 3. Route Protection
  useEffect(() => {
    if (isChecking) return

    const publicRoutes = ['/', '/auth', '/verify-email', '/api']
    const isPublic = publicRoutes.includes(location.pathname)

    if (!user && !isPublic) {
      navigate('/auth', { replace: true })
    }
    if (user && location.pathname === '/auth') {
      navigate('/subdomain', { replace: true })
    }
  }, [user, isChecking, location.pathname, navigate])

  if (isChecking) return <Loader />

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b0c10]/80 backdrop-blur-md border-b border-blue-900/30 flex items-center justify-between px-4 z-40 transition-all">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-wider hover:opacity-80 transition-opacity">
            DOMKU
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {!user && (
            <Link to="/auth" className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-all">
              <LogIn size={14} /> Masuk
            </Link>
          )}

          {user && (
             <button 
                onClick={() => navigate('/settings')} 
                className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-blue-500/30 group"
             >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold border border-blue-400 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm text-slate-300 font-medium max-w-[100px] truncate group-hover:text-white transition-colors">{user.name}</span>
             </button>
          )}

          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* SIDEBAR & CONTENT */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />

      <main className="pt-24 px-4 pb-10 max-w-7xl mx-auto min-h-screen">
        <Outlet context={{ user, refreshSession }} />
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-blue-900/10 mt-10">
        <p className="font-medium text-slate-500">&copy; 2026 Domku Manager</p>
        <p className="mt-1 opacity-70">made with ❤️ by Aka 🇮🇩</p>
      </footer>
    </div>
  )
}

export default Layout

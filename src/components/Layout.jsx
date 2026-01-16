import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Fungsi untuk refresh session dari localStorage
  const refreshSession = () => {
    const local = localStorage.getItem('domku_session')
    if (local) {
      try {
        setSession(JSON.parse(local))
      } catch (e) {
        localStorage.removeItem('domku_session')
        setSession(null)
      }
    } else {
      setSession(null)
    }
  }

  useEffect(() => {
    refreshSession()
    
    // Listener khusus jika ada perubahan storage di tab lain atau update profile
    window.addEventListener('storage', refreshSession)
    // Custom event untuk update instan
    window.addEventListener('session-update', refreshSession)

    return () => {
      window.removeEventListener('storage', refreshSession)
      window.removeEventListener('session-update', refreshSession)
    }
  }, [])

  // Proteksi Route: Jika tidak ada session & bukan di halaman publik, tendang ke auth
  useEffect(() => {
    const publicRoutes = ['/', '/auth', '/verify-email', '/api']
    const local = localStorage.getItem('domku_session')
    
    if (!local && !publicRoutes.includes(location.pathname)) {
      navigate('/auth')
    }
    // Logic Redirect Auto Dashboard jika sudah login akses home/auth
    if (local && (location.pathname === '/auth' || location.pathname === '/')) {
      navigate('/subdomain')
    }
  }, [location.pathname, navigate])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b0c10] border-b border-blue-900/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold text-blue-500 tracking-wider">DOMKU</Link>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
          <Menu size={28} />
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} session={session} />

      <main className="pt-20 px-4 pb-10 max-w-7xl mx-auto min-h-screen">
        <Outlet context={{ session, refreshSession }} />
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 border-t border-blue-900/20 mt-10">
        <p>&copy; 2026 Domku Manager</p>
      </footer>
    </div>
  )
}

export default Layout

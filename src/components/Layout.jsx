import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, LogIn } from 'lucide-react'
import Sidebar from './Sidebar'
import Loader from './Loader'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true) // State penting: Sedang memuat data?
  const navigate = useNavigate()
  const location = useLocation()

  // Fungsi baca session yang Stabil
  const refreshSession = useCallback(() => {
    try {
      const local = localStorage.getItem('domku_session')
      if (local) {
        const parsed = JSON.parse(local)
        // Validasi data user tidak korup
        if (parsed && parsed.email && parsed.api_key) {
          setUser(parsed)
        } else {
          // Data korup, hapus
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

  // 1. Inisialisasi Awal
  useEffect(() => {
    const init = async () => {
      setIsChecking(true)
      refreshSession()
      await new Promise(r => setTimeout(r, 500)) // Jeda sejenak biar smooth
      setIsChecking(false)
    }

    init()

    // Dengar event jika ada login/logout dari komponen lain
    window.addEventListener('storage', refreshSession)
    window.addEventListener('session-update', refreshSession)

    return () => {
      window.removeEventListener('storage', refreshSession)
      window.removeEventListener('session-update', refreshSession)
    }
  }, [refreshSession])

  // 2. Logika Redirect (Hanya jalan setelah Checking selesai)
  useEffect(() => {
    if (isChecking) return

    const publicRoutes = ['/', '/auth', '/verify-email', '/api']
    const isPublic = publicRoutes.includes(location.pathname)

    // Jika User Kosong & Bukan Halaman Publik -> Lempar ke Auth
    if (!user && !isPublic) {
      navigate('/auth', { replace: true })
    }

    // Jika User Ada & Sedang di Auth -> Lempar ke Dashboard
    if (user && location.pathname === '/auth') {
      navigate('/subdomain', { replace: true })
    }
  }, [user, isChecking, location.pathname, navigate])

  if (isChecking) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200 font-sans">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b0c10]/95 backdrop-blur-md border-b border-blue-900/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold text-blue-500 tracking-wider hover:opacity-80">
            DOMKU
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tombol Login (Jika belum login) */}
          {!user && (
            <Link to="/auth" className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-all">
              <LogIn size={14} /> Masuk
            </Link>
          )}

          {/* Profil Mini (Jika sudah login) */}
          {user && (
             <button 
                onClick={() => navigate('/settings')} 
                className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-blue-500/30"
             >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold border border-blue-400 overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm text-slate-300 font-medium max-w-[100px] truncate">{user.name}</span>
             </button>
          )}

          {/* Hamburger Menu */}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* SIDEBAR & CONTENT */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />

      <main className="pt-24 px-4 pb-10 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-300">
        {/* PENTING: context={user} diteruskan ke semua halaman anak */}
        <Outlet context={{ user, refreshSession }} />
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-blue-900/20 mt-10">
        <p>&copy; 2026 Domku Manager</p>
        <p className="mt-1">made with ❤️ by Aka 🇮🇩</p>
      </footer>
    </div>
  )
}

export default Layout

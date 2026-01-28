import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, LogIn, Mail, MailOpen } from 'lucide-react'
import Sidebar from './Sidebar'
import Loader from './Loader'
import Footer from './Footer'
import BanModal from './BanModal'
import { supabase } from '../lib/supabaseClient' // Import Supabase

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [showBanModal, setShowBanModal] = useState(false) // State Ban Popup
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const isNotifPage = currentPath === '/notifikasi'
  const targetLink = isNotifPage ? (location.state?.from || '/subdomain') : '/notifikasi'
  const linkState = isNotifPage ? {} : { from: currentPath }
  const allowedPaths = ['/', '/subdomain', '/notifikasi']
  const showNotifButton = allowedPaths.includes(currentPath)

  // LOGIC BAN CHECKER OTOMATIS
  useEffect(() => {
    const checkBanStatus = async () => {
        if (!user?.email) return
        const { data } = await supabase.from('banned_emails').select('id').eq('email', user.email).single()
        if (data) {
            setShowBanModal(true) // Munculkan modal jika email ada di blacklist
        }
    }
    if(user) checkBanStatus()
  }, [user, currentPath]) // Cek setiap pindah halaman

  const handleLogoutForce = () => {
      localStorage.removeItem('domku_session')
      setUser(null)
      setShowBanModal(false)
      navigate('/auth', { replace: true })
  }

  // ... (Sisa kode useEffect session & title SAMA SEPERTI SEBELUMNYA)
  // Copy paste bagian bawah ini:

  useEffect(() => {
    let title = 'Domku - DNS Manager'
    if (currentPath === '/auth') title = 'Login - Domku'
    if (currentPath === '/subdomain') title = 'Dashboard - Domku'
    if (currentPath === '/settings') title = 'Settings - Domku'
    if (currentPath === '/api') title = 'API Docs - Domku'
    if (currentPath === '/reset-password') title = 'Reset Password - Domku'
    if (currentPath === '/notifikasi') title = 'Inbox - Domku'
    document.title = title
  }, [currentPath])

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
      await new Promise(r => setTimeout(r, 200)) 
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

  useEffect(() => {
    if (isChecking) return
    const publicRoutes = ['/', '/auth', '/verify-email', '/reset-password', '/api', '/terms', '/privacy']
    const isPublic = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/api'))
    if (!user && !isPublic) navigate('/auth', { replace: true })
    if (user && (currentPath === '/auth' || currentPath === '/verify-email' || currentPath === '/reset-password')) navigate('/subdomain', { replace: true })
  }, [user, isChecking, currentPath, navigate])

  if (isChecking) return <Loader />

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200 font-sans flex flex-col">
      {/* BAN MODAL (Global) */}
      {showBanModal && <BanModal onLogout={handleLogoutForce} />}

      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b0c10]/80 backdrop-blur-md border-b border-blue-900/30 flex items-center justify-between px-4 z-40 transition-all md:pl-72">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-wider hover:opacity-80 transition-opacity md:hidden">
            DOMKU
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {!user && (
            <Link to="/auth" className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-all">
              <LogIn size={14} /> Masuk
            </Link>
          )}
          {user && (
             <>
               <button onClick={() => navigate('/settings')} className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-blue-500/30 group">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold border border-blue-400 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                    {user.avatar_url ? <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 font-medium max-w-[100px] truncate group-hover:text-white transition-colors">{user.name}</span>
               </button>
               {showNotifButton && (
                 <Link to={targetLink} state={linkState} className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center md:hidden ${isNotifPage ? 'bg-blue-600/20 text-blue-400 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5 scale-100'}`} title={isNotifPage ? "Kembali" : "Notifikasi"}>
                    {isNotifPage ? <MailOpen size={22} className="animate-in zoom-in duration-300"/> : <Mail size={22} className="animate-in zoom-in duration-300"/>}
                 </Link>
               )}
             </>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />

      <main className="pt-24 px-4 flex-1 w-full max-w-7xl mx-auto md:pl-72 transition-all duration-300">
        <Outlet context={{ user, refreshSession }} />
      </main>

      <div className="md:pl-72 transition-all duration-300">
        <Footer />
      </div>
    </div>
  )
}

export default Layout

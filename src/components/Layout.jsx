import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { supabase } from '../lib/supabaseClient'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Cek Session Manual (LocalStorage) - PRIORITAS UTAMA
    const localSession = localStorage.getItem('domku_session')
    
    if (localSession) {
      try {
        const user = JSON.parse(localSession)
        // Format object agar mirip dgn structure supabase session biar kompatibel
        setSession({ user: { ...user, email: user.email, user_metadata: { name: user.name, api_key: user.api_key } } })
      } catch (e) {
        localStorage.removeItem('domku_session')
      }
    } else {
      // 2. Fallback ke Supabase Auth (Jika nanti dipakai)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSession(session)
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
        <Outlet context={{ session }} />
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 border-t border-blue-900/20 mt-10">
        <p>&copy; 2026 Domku Manager</p>
        <p className="mt-1">made with ❤️ by Aka 🇮🇩</p>
      </footer>
    </div>
  )
}

export default Layout

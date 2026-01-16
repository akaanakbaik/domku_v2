import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Home, Globe, Code, LogOut, Settings, Copy, Check } from 'lucide-react'

const Sidebar = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('domku_session')
    window.dispatchEvent(new Event('session-update'))
    setShowLogoutConfirm(false)
    onClose()
    navigate('/')
  }

  const copyKey = (key) => {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const NavItem = ({ icon: Icon, label, path }) => (
    <div 
      onClick={() => { onClose(); navigate(path) }}
      className="flex items-center gap-3 p-3 text-slate-300 hover:bg-blue-900/20 hover:text-blue-400 rounded-lg cursor-pointer transition-all active:scale-95"
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  )

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full bg-[#111318] border-l border-blue-900/30 z-[60] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-[85%] md:w-[350px] shadow-2xl`}>
        
        {user ? (
          <div className="p-6 border-b border-blue-900/20 bg-[#0f1115]">
            <div className="flex justify-between items-start mb-4">
              <div className="relative group cursor-pointer" onClick={() => { onClose(); navigate('/settings') }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-lg group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-400 shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-[#1a1d24] p-1.5 rounded-full border border-blue-500 text-blue-400">
                  <Settings size={12} />
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            
            <h3 className="text-white font-bold text-lg truncate mb-1">{user.name}</h3>
            <p className="text-slate-500 text-xs mb-4 truncate">{user.email}</p>

            <div className="bg-black/30 p-2.5 rounded-lg border border-blue-900/30 flex items-center justify-between gap-2 group hover:border-blue-500/30 transition-colors">
              <code className="text-[10px] text-blue-300 font-mono truncate flex-1 opacity-70 group-hover:opacity-100">
                {user.api_key}
              </code>
              <button onClick={() => copyKey(user.api_key)} className="text-slate-400 hover:text-white">
                {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 flex justify-between items-center border-b border-blue-900/20">
            <span className="text-blue-500 font-bold text-lg">Menu Domku</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={24} /></button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Globe} label="Subdomain" path="/subdomain" />
          <NavItem icon={Code} label="Dokumentasi API" path="/api" />
        </div>

        <div className="p-4 border-t border-blue-900/20">
          {user ? (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/10 hover:bg-red-900/20 text-red-400 rounded-xl border border-red-900/20 transition-all font-medium"
            >
              <LogOut size={18} /> Keluar
            </button>
          ) : (
            <button 
              onClick={() => { onClose(); navigate('/auth'); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              Daftar / Masuk
            </button>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1d24] w-full max-w-sm p-6 rounded-2xl border border-red-500/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Keluar</h3>
            <p className="text-slate-400 mb-6 text-sm">Sesi Anda akan dihapus dari perangkat ini. Anda harus login ulang dengan OTP nanti.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 text-slate-300 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors font-medium">Batal</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar

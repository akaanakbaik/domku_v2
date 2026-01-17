import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Home, Globe, Code, LogOut, Settings, Copy, Check, UserCog, Activity } from 'lucide-react'

const Sidebar = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    if (isOpen) {
      // Cek kesehatan server saat sidebar dibuka
      const checkStatus = async () => {
        try {
          const res = await fetch('/api/status')
          setServerStatus(res.ok ? 'online' : 'offline')
        } catch (e) {
          setServerStatus('offline')
        }
      }
      checkStatus()
    }
  }, [isOpen])

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
      className="flex items-center gap-3 p-3 text-slate-300 hover:bg-blue-900/20 hover:text-blue-400 rounded-lg cursor-pointer transition-all active:scale-95 group"
    >
      <Icon size={20} className="group-hover:scale-110 transition-transform"/>
      <span className="font-medium">{label}</span>
    </div>
  )

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full bg-[#0b0c10]/95 border-l border-blue-900/30 z-[60] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-[85%] md:w-[350px] shadow-2xl`}>
        
        {user ? (
          <div className="p-6 border-b border-blue-900/20 bg-gradient-to-b from-blue-900/10 to-transparent">
            <div className="flex justify-between items-start mb-4">
              <div className="relative group cursor-pointer" onClick={() => { onClose(); navigate('/settings') }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-lg group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-400 shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-[#0b0c10] p-1 rounded-full border border-blue-500 text-blue-400">
                  <Settings size={10} />
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            
            <h3 className="text-white font-bold text-lg truncate mb-1">{user.name}</h3>
            <p className="text-slate-500 text-xs mb-4 truncate">{user.email}</p>

            <div className="bg-black/30 p-2.5 rounded-lg border border-blue-900/30 flex items-center justify-between gap-2 group hover:border-blue-500/30 transition-colors cursor-pointer" onClick={() => copyKey(user.api_key)}>
              <code className="text-[10px] text-blue-300 font-mono truncate flex-1 opacity-70 group-hover:opacity-100">
                {user.api_key}
              </code>
              <div className="text-slate-400 hover:text-white">
                {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 flex justify-between items-center border-b border-blue-900/20">
            <span className="text-blue-500 font-bold text-lg tracking-wide">Menu Domku</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={24} /></button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Globe} label="Subdomain Manager" path="/subdomain" />
          <NavItem icon={Code} label="Dokumentasi API" path="/api" />
          {user && (
            <>
              <div className="h-px bg-blue-900/20 my-2 mx-2"></div>
              <NavItem icon={UserCog} label="Pengaturan Akun" path="/settings" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-blue-900/20 space-y-4">
          {/* Server Status Indicator */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-500 font-mono bg-black/40 rounded-lg border border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={12} /> SYSTEM STATUS
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={serverStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                {serverStatus === 'online' ? 'OPERATIONAL' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {user ? (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/10 hover:bg-red-900/20 text-red-400 rounded-xl border border-red-900/20 transition-all font-medium text-sm"
            >
              <LogOut size={16} /> Keluar Sesi
            </button>
          ) : (
            <button 
              onClick={() => { onClose(); navigate('/auth'); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 text-sm"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1d24] w-full max-w-sm p-6 rounded-2xl border border-red-500/20 shadow-2xl scale-100">
            <h3 className="text-lg font-bold text-white mb-2">Akhiri Sesi?</h3>
            <p className="text-slate-400 mb-6 text-sm">Anda harus login ulang menggunakan kode OTP untuk mengakses akun kembali.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 text-slate-300 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-medium text-sm">Batal</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors text-sm">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar

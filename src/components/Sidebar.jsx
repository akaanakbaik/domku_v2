import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Home, Globe, Code, Info, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const Sidebar = ({ isOpen, onClose, session }) => {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [showDevInfo, setShowDevInfo] = useState(false)

  const userEmail = session?.user?.email || ''
  const userName = userEmail.split('@')[0]
  const displayName = userName.length > 10 ? `${userName.substring(0, 10)}...` : userName

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowLogoutConfirm(false)
    onClose()
    navigate('/')
  }

  const handleRestrictedLink = (e, path) => {
    e.preventDefault()
    if (!session) {
      setShowLoginAlert(true)
    } else {
      onClose()
      navigate(path)
    }
  }

  const NavItem = ({ icon: Icon, label, path, isRestricted }) => (
    <div 
      onClick={(e) => isRestricted ? handleRestrictedLink(e, path) : (path === '#info' ? setShowDevInfo(true) : (onClose(), navigate(path)))}
      className="flex items-center gap-3 p-3 text-slate-300 hover:bg-blue-900/20 hover:text-blue-400 rounded-lg cursor-pointer transition-all"
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  )

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full bg-[#111318] border-l border-blue-900/30 z-[60] transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-[50%] md:w-[25%]`}>
        <div className="p-4 flex justify-between items-center border-b border-blue-900/20">
          <span className="text-blue-500 font-bold">Menu</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavItem icon={Home} label="Home" path="/" />
          <NavItem icon={Globe} label="Subdomain" path="/subdomain" isRestricted={true} />
          <NavItem icon={Code} label="API" path="/api" isRestricted={true} />
          <NavItem icon={Info} label="Info Developer" path="#info" />
        </div>

        {session ? (
          <div className="p-4 border-t border-blue-900/20 bg-[#0f1115]">
            <div 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 cursor-pointer hover:bg-blue-900/10 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{displayName}</span>
                <span className="text-xs text-blue-400">Online</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-blue-900/20">
             <button 
               onClick={() => { onClose(); navigate('/auth'); }}
               className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
             >
               Daftar / Masuk
             </button>
          </div>
        )}
      </div>

      {showLoginAlert && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80">
          <div className="bg-[#1a1d24] p-6 rounded-xl border border-blue-500/30 max-w-sm w-full text-center shadow-2xl shadow-blue-900/20">
            <h3 className="text-xl font-bold text-white mb-2">Akses Terbatas</h3>
            <p className="text-slate-400 mb-6 text-sm">Anda harus Daftar atau Login terlebih dahulu.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLoginAlert(false)}
                className="flex-1 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => { setShowLoginAlert(false); onClose(); navigate('/auth'); }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Daftar / Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#1a1d24] w-full max-w-sm p-5 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <LogOut size={24} />
              <span className="font-bold text-lg">Konfirmasi Keluar</span>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Yakin ingin keluar?</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg font-medium"
              >
                Ya, Keluar
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showDevInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0b0c10] border border-blue-500/30 rounded-2xl p-6 max-w-sm w-full relative overflow-hidden">
            <button 
              onClick={() => setShowDevInfo(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-2 border-blue-500 p-1 mb-4">
                <img 
                  src="https://cdn.yupra.my.id/yp/2jz78png.jpg" 
                  alt="Aka" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Aka</h3>
              <span className="text-blue-400 text-xs mb-4 bg-blue-900/20 px-3 py-1 rounded-full">Developer</span>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Saya adalah pelajar di SMA negeri 1 Lembah Melintang dan developer pemula yg berasal dari Sumatra Barat, Indonesia 🇮🇩. 
                Saya buat website ini untuk membantu sesama developer lainnya.
              </p>
              <div className="w-full pt-4 border-t border-blue-900/20">
                 <p className="text-xs text-slate-500">© 2025 Domku</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar

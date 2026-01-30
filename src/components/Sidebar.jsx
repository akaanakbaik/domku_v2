import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, Terminal, Settings, LogOut, X, User, Shield, Sparkles, BadgeCheck, Mail, MailOpen, Lock, LayoutGrid, ChevronRight } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation()
  const path = location.pathname
  const { addToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLogout = () => {
    localStorage.removeItem('domku_session')
    window.location.href = '/auth'
    addToast('success', 'Berhasil keluar sesi')
  }

  const isAdmin = user?.email === 'khaliqarrasyidabdul@gmail.com'
  const createdDate = user?.created_at ? new Date(user.created_at) : new Date()
  const diffDays = Math.ceil(Math.abs(new Date() - createdDate) / (1000 * 60 * 60 * 24))
  const isNewUser = diffDays <= 3

  const menus = [
    { name: 'Beranda', icon: <Home size={18} />, link: '/', public: true },
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, link: '/subdomain', public: false },
    { name: 'Dokumentasi API', icon: <Terminal size={18} />, link: '/api', public: true },
    { name: 'Pengaturan', icon: <Settings size={18} />, link: '/settings', public: false },
  ]

  const isNotifPage = path === '/notifikasi'

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      <aside 
        className={`fixed top-0 bottom-0 z-50 w-[280px] bg-[#0b0c10] border-l md:border-r md:border-l-0 border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        right-0 md:left-0 
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >

        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0b0c10]/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku Logo" className="w-8 h-8 object-contain drop-shadow-lg" />
                <span className="text-lg font-bold text-white tracking-wide">DOMKU</span>
            </div>

            <div className="flex items-center gap-2 md:hidden">
                {user && (
                    <Link 
                        to={isNotifPage ? "/subdomain" : "/notifikasi"}
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${isNotifPage ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {isNotifPage ? <MailOpen size={18}/> : <Mail size={18}/>}
                    </Link>
                )}
                <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20}/>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            
            {user && (
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                    <div className="relative bg-[#111318] p-4 rounded-xl border border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-600 p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center text-white font-bold text-sm">
                                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : user.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111318] rounded-full"></div>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                                    {user.name} 
                                    {isAdmin && <BadgeCheck size={14} className="text-blue-500 fill-blue-500/10" />}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isAdmin ? (
                                <span className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 flex items-center justify-center gap-1.5">
                                    <Shield size={12} /> ADMINISTRATOR
                                </span>
                            ) : isNewUser ? (
                                <span className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 flex items-center justify-center gap-1.5">
                                    <Sparkles size={12} /> NEW MEMBER
                                </span>
                            ) : (
                                <span className="flex-1 py-1.5 rounded-lg bg-slate-700/30 text-slate-300 text-[10px] font-bold border border-slate-600/30 flex items-center justify-center gap-1.5">
                                    <User size={12} /> REGULAR
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Navigasi Utama</p>
              {menus.map((menu) => {
                if (!user && !menu.public) return null
                const isActive = path === menu.link
                return (
                    <Link 
                      key={menu.name} 
                      to={menu.link}
                      onClick={() => onClose()}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{menu.icon}</div>
                      <span>{menu.name}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-70"/>}
                    </Link>
                )
              })}

              {isAdmin && (
                 <div className="pt-6">
                    <p className="px-2 text-[10px] font-bold text-red-500/80 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Lock size={10}/> Zona Admin</p>
                    <Link 
                        to="/k-control-panel-x9z"
                        onClick={() => onClose()}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/20 hover:border-red-500/40 transition-all group hover:shadow-lg hover:shadow-red-900/10"
                    >
                        <LayoutGrid size={18} className="text-red-400 group-hover:text-white transition-colors"/>
                        Admin Panel
                        <ChevronRight size={14} className="ml-auto text-red-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"/>
                    </Link>
                 </div>
              )}
            </nav>

        </div>

        {user && (
            <div className="p-4 border-t border-white/5 bg-[#0b0c10]">
                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform"/> Keluar Akun
                </button>
            </div>
        )}

      </aside>
    </>
  )
}

export default Sidebar

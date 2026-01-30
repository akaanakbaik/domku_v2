import React from 'react'
import { ShieldAlert, LogOut, MessageCircle } from 'lucide-react'

const BanModal = ({ onLogout }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-[#111318] border border-red-600/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)]"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-6 flex justify-center">
            <div className="p-4 bg-red-600/10 rounded-full border border-red-600/20 shadow-lg animate-pulse">
                <ShieldAlert size={48} className="text-red-500"/>
            </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">AKSES DIBEKUKAN</h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Akun Anda telah dinonaktifkan karena terdeteksi melakukan aktivitas mencurigakan yang melanggar <span className="font-bold text-white cursor-pointer hover:underline" onClick={onLogout}>Terms of Service</span> dan <span className="font-bold text-white cursor-pointer hover:underline" onClick={onLogout}>Privacy Policy</span>.
        </p>

        <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4 mb-6 text-left">
            <p className="text-[11px] text-red-200 font-mono">
                <span className="font-bold">STATUS:</span> PERMANENT BAN<br/>
                <span className="font-bold">CODE:</span> VIOLATION_DETECTED<br/>
                <span className="font-bold">ACTION:</span> LOGOUT REQUIRED
            </p>
        </div>

        <div className="space-y-3">
            <a href="https://t.me/akamodebaik" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                <MessageCircle size={16}/> Hubungi Admin (Telegram)
            </a>
            
            <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a1d24] hover:bg-[#20232b] text-slate-400 hover:text-white rounded-xl font-bold text-sm transition-all border border-white/5">
                <LogOut size={16}/> Keluar Aplikasi
            </button>
        </div>

      </div>
    </div>
  )
}

export default BanModal

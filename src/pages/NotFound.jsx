import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home, Activity } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-lg relative z-10 text-center">
        
        <div className="mb-8 relative inline-block group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
          <div className="relative bg-[#16181d] border border-white/5 p-6 rounded-3xl shadow-2xl ring-1 ring-white/5 group-hover:-translate-y-1 transition-transform duration-500">
            <FileQuestion size={48} className="text-blue-500" />
          </div>
          
          <div className="absolute -right-2 -top-2 bg-[#111318] border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <Activity size={10} className="animate-pulse" /> 404 ERROR
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-none">
          Page Not <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Found</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada di dimensi ini. Silakan periksa URL atau kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 bg-[#16181d] hover:bg-[#1c1f26] border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Kembali
          </button>

          <Link 
            to="/" 
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
          >
            <Home size={16} /> Ke Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[10px] text-slate-600 font-mono">
            SYSTEM_ID: ERR_NOT_FOUND_404
          </p>
        </div>

      </div>
    </div>
  )
}

export default NotFound

import React from 'react'
import { Link } from 'react-router-dom'
import { Ghost, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in duration-300">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
        <div className="relative bg-[#111318] border border-blue-900/30 p-8 rounded-full ring-1 ring-blue-500/30 shadow-2xl">
          <Ghost size={64} className="text-blue-400" />
        </div>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold text-white mb-2 tracking-tighter">404</h1>
      <h2 className="text-xl md:text-2xl text-slate-300 mb-6 font-medium">Halaman Hilang di Angkasa</h2>
      
      <p className="text-slate-500 max-w-md mb-8">
        Sepertinya Anda tersesat. Halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke dimensi lain.
      </p>

      <Link 
        to="/" 
        className="group px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Markas
      </Link>
    </div>
  )
}

export default NotFound

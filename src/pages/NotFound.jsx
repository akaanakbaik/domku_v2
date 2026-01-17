import React from 'react'
import { Link } from 'react-router-dom'
import { Ghost } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-blue-900/10 p-6 rounded-full mb-6 ring-1 ring-blue-500/30">
        <Ghost size={64} className="text-blue-400" />
      </div>
      <h1 className="text-6xl font-bold text-white mb-2">404</h1>
      <h2 className="text-xl text-slate-300 font-medium mb-6">Halaman Hilang di Angkasa</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau memang tidak pernah ada.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
      >
        Kembali ke Home
      </Link>
    </div>
  )
}

export default NotFound

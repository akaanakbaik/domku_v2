import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Shield, Zap, Lock, Send, Mail, ArrowRight } from 'lucide-react'

const Home = () => {
  const { session } = useOutletContext()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 animate-in fade-in zoom-in duration-500">
        
        <div className="relative mb-8 group cursor-default">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
          <img 
            src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" 
            alt="Domku Logo" 
            className="relative w-32 md:w-48 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent mb-6 tracking-tight">
          DOMKU
        </h1>
        
        <p className="text-slate-400 max-w-xl text-lg md:text-xl mb-10 leading-relaxed">
          Kelola subdomain <span className="text-blue-400 font-semibold">.domku.my.id</span> Anda dengan mudah, cepat, dan terintegrasi langsung dengan Cloudflare Enterprise DNS.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md z-10">
          <Link 
            to={session ? "/subdomain" : "/auth"}
            className="group flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] text-center flex items-center justify-center gap-2"
          >
            {session ? 'Buka Dashboard' : 'Mulai Sekarang'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          {!session && (
            <Link 
              to="/auth" 
              className="flex-1 py-3.5 px-6 bg-[#1a1d24] hover:bg-[#252932] text-slate-200 border border-blue-900/50 rounded-xl font-bold transition-all text-center hover:border-blue-500"
            >
              Masuk Akun
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left">
          <div className="p-6 bg-[#111318]/50 backdrop-blur-sm border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-900/30 transition-colors">
              <Zap className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Setup</h3>
            <p className="text-slate-500 text-sm leading-relaxed">DNS Record Anda akan terpropagasi ke seluruh dunia dalam hitungan detik berkat jaringan anycast Cloudflare.</p>
          </div>
          <div className="p-6 bg-[#111318]/50 backdrop-blur-sm border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-900/30 transition-colors">
              <Shield className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Kami tidak menyimpan log traffic Anda. Sistem autentikasi berlapis menjamin keamanan akun Anda.</p>
          </div>
          <div className="p-6 bg-[#111318]/50 backdrop-blur-sm border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-900/30 transition-colors">
              <Lock className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Developer Friendly</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Integrasikan manajemen subdomain ke dalam aplikasi Anda menggunakan REST API kami yang sederhana.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

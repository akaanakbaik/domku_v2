import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Shield, Zap, Lock, ArrowRight, Activity, Globe, Code2, Server } from 'lucide-react'

const Home = () => {
  const context = useOutletContext()
  const user = context?.user

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden selection:bg-blue-500/30">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0b0c10]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 pt-10 pb-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-8 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          System Operational v2.0
        </div>

        <div className="relative mb-6 group cursor-default">
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <img 
            src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" 
            alt="Domku Logo" 
            className="relative w-28 md:w-40 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          Manage DNS <br className="md:hidden" />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent"> Like a Pro</span>
        </h1>

        <p className="text-slate-400 max-w-xl text-sm md:text-lg mb-8 leading-relaxed px-4">
          Layanan manajemen subdomain <span className="text-blue-400 font-semibold font-mono">.domku.my.id</span> gratis, cepat, dan aman. Terintegrasi langsung dengan infrastruktur Cloudflare Enterprise.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md">
          {user ? (
            <Link 
              to="/subdomain"
              className="group flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-center flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
               <Link 
                to="/auth" 
                className="group flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-center flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Mulai Gratis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/auth" 
                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl font-bold transition-all text-center hover:border-white/20 text-sm md:text-base backdrop-blur-sm"
              >
                Masuk
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-bold"><Globe size={16}/> Cloudflare DNS</div>
           <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-bold"><Server size={16}/> Supabase DB</div>
           <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-bold"><Code2 size={16}/> REST API</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full text-left">
          
          <div className="p-5 bg-[#16181d]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="text-blue-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Ultra Fast</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Propagasi DNS instan. Subdomain Anda aktif dan bisa diakses dalam hitungan detik setelah dibuat.</p>
          </div>

          <div className="p-5 bg-[#16181d]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-green-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-10 h-10 bg-green-900/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Shield className="text-green-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Secure Core</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Dilindungi oleh Rate Limiting, Enkripsi Database, dan Proteksi Cloudflare. Privasi Anda prioritas kami.</p>
          </div>

          <div className="p-5 bg-[#16181d]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all hover:-translate-y-1 group">
            <div className="w-10 h-10 bg-purple-900/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="text-purple-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Live Activity</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Pantau setiap perubahan DNS record Anda secara realtime melalui Dashboard atau Activity Log API.</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home

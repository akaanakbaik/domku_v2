import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Zap, Globe, Lock, Send, Mail } from 'lucide-react'

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 animate-in fade-in zoom-in duration-500">
        <div className="bg-blue-500/10 p-4 rounded-full mb-6 ring-1 ring-blue-500/50">
          <Globe size={48} className="text-blue-400" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent mb-6">
          DOMKU
        </h1>
        
        <p className="text-slate-400 max-w-xl text-lg md:text-xl mb-8 leading-relaxed">
          Layanan pembuatan subdomain gratis, cepat, dan aman untuk developer. 
          Kelola DNS record Anda dengan mudah dan terintegrasi dengan Cloudflare.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link 
            to="/subdomain" 
            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] text-center"
          >
            Buat Subdomain
          </Link>
          <Link 
            to="/auth" 
            className="flex-1 py-3 px-6 bg-[#1a1d24] hover:bg-[#252932] text-slate-200 border border-blue-900/50 rounded-xl font-semibold transition-all text-center"
          >
            Daftar / Masuk
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl text-left">
          <div className="p-6 bg-[#111318] border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-colors">
            <Zap className="text-yellow-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Instant Setup</h3>
            <p className="text-slate-500 text-sm">Subdomain aktif dalam hitungan detik dengan propagasi DNS tercepat via Cloudflare.</p>
          </div>
          <div className="p-6 bg-[#111318] border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-colors">
            <Shield className="text-green-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Anti DDoS</h3>
            <p className="text-slate-500 text-sm">Sistem keamanan berlapis dengan verifikasi OTP dan proteksi Cloudflare.</p>
          </div>
          <div className="p-6 bg-[#111318] border border-blue-900/20 rounded-2xl hover:border-blue-500/30 transition-colors">
            <Lock className="text-blue-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">API Access</h3>
            <p className="text-slate-500 text-sm">Integrasikan layanan kami ke aplikasi Anda dengan REST API yang lengkap.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-900/20 bg-[#0d0f14] py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-white text-lg">Butuh Bantuan?</h4>
            <p className="text-slate-500 text-sm mt-1">Hubungi developer jika menemukan kendala.</p>
          </div>
          <div className="flex gap-4">
            <a href="https://t.me/akamodebaik" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1a1d24] rounded-lg text-blue-400 hover:text-white transition-colors">
              <Send size={18} /> Telegram
            </a>
            <a href="mailto:akaanakbaik17@proton.me" className="flex items-center gap-2 px-4 py-2 bg-[#1a1d24] rounded-lg text-blue-400 hover:text-white transition-colors">
              <Mail size={18} /> Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

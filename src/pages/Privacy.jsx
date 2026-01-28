import React from 'react'
import { Lock, Eye, Database, Globe, Share2, Server, Fingerprint, ShieldCheck, CheckCircle2, AlertOctagon, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const Privacy = () => {
  return (
    <div className="max-w-5xl mx-auto pb-16 md:pb-24 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="text-center py-10 md:py-16 space-y-4 md:space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-green-500/5 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse-slow">
          <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> Kebijakan Privasi
        </div>

        <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto px-2">
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Keamanan Data & <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Privasi Anda</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-base leading-relaxed max-w-2xl mx-auto">
              Kami berkomitmen penuh untuk melindungi informasi pribadi Anda. Transparansi adalah kunci layanan kami.
            </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-medium text-slate-500 px-2">
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 md:px-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"><CheckCircle2 size={10} className="md:w-3 md:h-3 text-green-500"/> Enkripsi End-to-End</span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 md:px-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"><CheckCircle2 size={10} className="md:w-3 md:h-3 text-green-500"/> Tanpa Iklan</span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 md:px-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"><CheckCircle2 size={10} className="md:w-3 md:h-3 text-green-500"/> GDPR Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        <div className="bg-[#111318] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-green-500/30 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-green-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-green-500/5 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-green-500/20 transition-colors border border-green-500/20 shadow-inner">
            <Database className="text-green-500 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Pengumpulan Data</h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
            Kami hanya mengumpulkan data esensial yang diperlukan untuk operasional teknis layanan DNS manager:
          </p>
          <ul className="space-y-2 md:space-y-3">
            {[
              { icon: Fingerprint, text: "Identitas Akun (Nama & Email)" },
              { icon: Lock, text: "Kredensial Akses (Hash Bcrypt)" },
              { icon: Server, text: "Log Aktivitas & Alamat IP" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[10px] md:text-sm text-slate-300 bg-black/20 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="p-1 md:p-1.5 bg-green-500/10 rounded-md md:rounded-lg"><item.icon size={12} className="md:w-3.5 md:h-3.5 text-green-400"/></div>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111318] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-500/5 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20 shadow-inner">
            <Eye className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Penggunaan Informasi</h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 text-justify">
            Data Anda digunakan secara eksklusif untuk kepentingan teknis dan keamanan, tanpa komersialisasi ke pihak ketiga:
          </p>
          <div className="grid grid-cols-1 gap-2">
             <div className="flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                <div className="mt-0.5"><CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-400"/></div>
                <p className="text-[10px] md:text-xs text-blue-100/80 leading-relaxed">Autentikasi sesi login dan pemulihan akun.</p>
             </div>
             <div className="flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                <div className="mt-0.5"><CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-400"/></div>
                <p className="text-[10px] md:text-xs text-blue-100/80 leading-relaxed">Sinkronisasi record DNS ke server Cloudflare.</p>
             </div>
             <div className="flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                <div className="mt-0.5"><CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-400"/></div>
                <p className="text-[10px] md:text-xs text-blue-100/80 leading-relaxed">Deteksi dini aktivitas mencurigakan (Anti-Abuse).</p>
             </div>
          </div>
        </div>

        <div className="bg-[#111318] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-purple-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-purple-500/5 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20 shadow-inner">
            <Share2 className="text-purple-500 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Integrasi Eksternal</h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4">
            Layanan kami terhubung langsung dengan API infrastruktur global untuk penyebaran DNS yang cepat.
          </p>
          <div className="bg-purple-900/10 border border-purple-500/20 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 hover:bg-purple-900/20 transition-colors">
             <div className="bg-[#111] p-1.5 md:p-2 rounded-lg border border-white/10"><Globe size={16} className="md:w-5 md:h-5 text-white"/></div>
             <div>
                <h4 className="text-xs md:text-sm font-bold text-white">Cloudflare API</h4>
                <p className="text-[10px] md:text-xs text-slate-400">DNS Propagation Partner</p>
             </div>
          </div>
          <p className="mt-4 text-[10px] md:text-xs text-slate-500 italic border-l-2 border-purple-500/30 pl-3">
            *Kami tidak pernah menjual data ke jaringan iklan atau broker data manapun.
          </p>
        </div>

        <div className="bg-[#111318] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-red-500/30 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-red-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-red-500/5 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-red-500/20 transition-colors border border-red-500/20 shadow-inner">
            <Lock className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Standar Keamanan</h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 text-justify">
            Keamanan adalah prioritas utama. Kami menerapkan protokol keamanan berlapis untuk melindungi aset digital Anda.
          </p>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
             <div className="bg-red-500/5 border border-red-500/10 p-2.5 md:p-3 rounded-xl text-center hover:bg-red-500/10 transition-colors">
                <p className="text-[10px] md:text-xs font-bold text-red-300 uppercase tracking-wider mb-0.5 md:mb-1">Enkripsi</p>
                <p className="text-[9px] md:text-[10px] text-slate-400">AES-256 & Bcrypt</p>
             </div>
             <div className="bg-red-500/5 border border-red-500/10 p-2.5 md:p-3 rounded-xl text-center hover:bg-red-500/10 transition-colors">
                <p className="text-[10px] md:text-xs font-bold text-red-300 uppercase tracking-wider mb-0.5 md:mb-1">Koneksi</p>
                <p className="text-[9px] md:text-[10px] text-slate-400">HTTPS / SSL / TLS 1.3</p>
             </div>
          </div>
        </div>

      </div>

      <div className="mt-12 md:mt-16 p-6 md:p-8 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10 rounded-2xl md:rounded-3xl border border-white/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <FileText size={32} className="mx-auto text-slate-600 mb-3 md:mb-4 opacity-50 md:w-10 md:h-10"/>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-2 max-w-lg mx-auto leading-relaxed">
            Penggunaan layanan Domku Manager tunduk pada kebijakan privasi ini dan persyaratan layanan kami.
        </p>
        <Link to="/terms" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-blue-400 hover:text-white transition-colors bg-blue-500/10 hover:bg-blue-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-blue-500/20 mt-1 group">
            Baca Terms of Service <AlertOctagon size={10} className="md:w-3 md:h-3 group-hover:rotate-12 transition-transform"/>
        </Link>
        <p className="text-[9px] md:text-[10px] text-slate-600 font-mono mt-4 md:mt-6">
            Last Update: 2026.01.20_REV_2.4
        </p>
      </div>

    </div>
  )
}

export default Privacy

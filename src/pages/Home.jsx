import React, { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Shield, Zap, MessageSquare, Image as ImageIcon, Send, Loader2, Globe, Database, Server, Lock, ArrowRight, Activity } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const Home = () => {
  const context = useOutletContext()
  const user = context?.user
  const { addToast } = useToast()

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)

  const handleSendReport = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('subject', form.subject)
      formData.append('message', form.message)
      if (file) formData.append('image', file)

      const res = await fetch('/api/contact/send', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success) {
        addToast('success', "Pesan terkirim! Tim kami akan segera merespon.")
        setForm({ name: '', email: '', subject: '', message: '' })
        setFile(null)
      } else {
        addToast('error', "Gagal mengirim: " + (data.error || "Kesalahan server"))
      }
    } catch (e) {
      addToast('error', "Koneksi terputus. Coba lagi nanti.")
    } finally {
      setSending(false)
    }
  }

  const features = [
    { icon: <Globe className="text-blue-400" size={16}/>, title: "Subdomain Gratis", desc: "Dapatkan .domku.my.id instan." },
    { icon: <Server className="text-purple-400" size={16}/>, title: "Cloudflare DNS", desc: "Infrastruktur global cepat & aman." },
    { icon: <Database className="text-green-400" size={16}/>, title: "API Integration", desc: "Otomatisasi DNS via REST API." },
    { icon: <Lock className="text-red-400" size={16}/>, title: "SSL Security", desc: "Dukungan penuh HTTPS/SSL." }
  ]

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden selection:bg-blue-500/30">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-5xl px-4 pt-16 md:pt-24 pb-8 md:pb-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        
        <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <img 
                src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" 
                alt="Domku Logo" 
                className="relative w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          Domku <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Manager</span>
        </h1>
        
        <p className="text-slate-400 max-w-xl text-xs sm:text-sm md:text-base mb-8 leading-relaxed font-light px-4">
          Platform manajemen subdomain gratis dengan teknologi Cloudflare Enterprise. Kelola DNS Record (A, CNAME, TXT) dengan mudah, cepat, dan aman.
        </p>

        <div className="flex gap-3">
          <Link to={user ? "/subdomain" : "/auth"} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 flex items-center gap-2">
            {user ? "Buka Dashboard" : "Mulai Sekarang"} <ArrowRight size={14}/>
          </Link>
          <Link to="/api" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-xs md:text-sm transition-all border border-white/10 flex items-center gap-2">
            <Database size={14}/> API Docs
          </Link>
        </div>
      </div>

      <div className="w-full max-w-5xl px-4 pb-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {features.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0e1015]/80 backdrop-blur-sm border border-white/5 hover:border-blue-500/20 transition-all group hover:-translate-y-1">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                    {item.icon}
                </div>
                <h3 className="text-white font-bold text-xs md:text-sm mb-1">{item.title}</h3>
                <p className="text-slate-500 text-[10px] leading-tight">{item.desc}</p>
            </div>
        ))}
      </div>

      <div className="w-full max-w-4xl px-4 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        <div className="hidden md:block space-y-4 pt-2">
            <div className="bg-[#111318] p-5 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-blue-400"/> Status Sistem
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-slate-400">API Server</span>
                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Online</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-slate-400">Cloudflare DNS</span>
                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Operational</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Database</span>
                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Stable</span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-2">Butuh Bantuan?</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Tim support kami siap membantu kendala teknis Anda 24/7. Hubungi kami melalui formulir di samping.
                </p>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <Zap size={12} className="text-yellow-400"/>
                        <span className="text-[10px] text-slate-300 font-bold">Fast Response</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <Shield size={12} className="text-green-400"/>
                        <span className="text-[10px] text-slate-300 font-bold">Secure Data</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden bg-[#16181d]/90 backdrop-blur-md w-full">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><MessageSquare size={16}/></div>
                    <div>
                        <h3 className="text-xs font-bold text-white">Hubungi Kami</h3>
                        <p className="text-[10px] text-slate-500">Kirim laporan / saran</p>
                    </div>
                </div>
                <div className="bg-green-500/10 text-green-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-green-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                </div>
            </div>

            <form onSubmit={handleSendReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" placeholder="Nama Anda" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[11px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600"/>
                    </div>
                    <div className="space-y-1">
                        <input required value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="Email Aktif" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[11px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600"/>
                    </div>
                </div>

                <div className="space-y-1">
                    <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} type="text" placeholder="Subjek Laporan" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[11px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600"/>
                </div>

                <div className="space-y-1">
                    <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="4" placeholder="Deskripsikan masalah atau saran Anda..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[11px] text-white focus:border-blue-500 outline-none resize-none transition-colors placeholder-slate-600"></textarea>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 overflow-hidden active:scale-95 group h-9">
                        <ImageIcon size={12} className="group-hover:text-blue-400 transition-colors"/> 
                        <span className="truncate max-w-[80px]">{file ? file.name : "Lampiran"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])}/>
                    </label>

                    <button type="submit" disabled={sending} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95 h-9">
                        {sending ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>} Kirim Pesan
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  )
}

export default Home

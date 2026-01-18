import React, { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Shield, Zap, MessageSquare, Image as ImageIcon, Send, Loader2 } from 'lucide-react'

const Home = () => {
  const context = useOutletContext()
  const user = context?.user

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
        alert("Laporan terkirim! Terima kasih atas masukan Anda.")
        setForm({ name: '', email: '', subject: '', message: '' })
        setFile(null)
      } else {
        alert("Gagal: " + data.error)
      }
    } catch (e) { alert("Error koneksi.") }
    finally { setSending(false) }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden selection:bg-blue-500/30">
      
      <div className="w-full max-w-5xl px-4 pt-16 pb-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-6">
          System v2.0 Secure
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Domku <span className="text-blue-500">Manager</span>
        </h1>
        <p className="text-slate-400 max-w-lg text-sm md:text-base mb-8 leading-relaxed">
          Platform manajemen DNS modern dengan keamanan berlapis, API Token, dan integrasi Cloudflare Enterprise.
        </p>

        <div className="flex gap-4">
          <Link to={user ? "/subdomain" : "/auth"} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
            {user ? "Dashboard" : "Mulai Sekarang"}
          </Link>
        </div>
      </div>

      <div className="w-full max-w-4xl px-4 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        <div className="space-y-6 text-left pt-4">
            <h3 className="text-2xl font-bold text-white">Pusat Bantuan & Saran</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
                Kami sangat menghargai masukan Anda. Jika Anda menemukan bug, kendala keamanan, atau memiliki ide fitur baru, silakan hubungi kami langsung.
            </p>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Zap size={18}/></div>
                    <div><h4 className="text-white text-sm font-bold">Respon Cepat</h4><p className="text-[10px] text-slate-500">Tim kami aktif memantau laporan.</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Shield size={18}/></div>
                    <div><h4 className="text-white text-sm font-bold">Privasi Terjaga</h4><p className="text-[10px] text-slate-500">Data laporan dienkripsi.</p></div>
                </div>
            </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <MessageSquare size={18} className="text-blue-400"/>
                <h3 className="text-sm font-bold text-white">Formulir Aduan</h3>
            </div>
            
            <form onSubmit={handleSendReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" placeholder="Nama Anda" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"/>
                    <input required value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="Email Kontak" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"/>
                </div>
                <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} type="text" placeholder="Judul Masalah / Saran" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"/>
                <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="4" placeholder="Jelaskan detail masalah..." className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none resize-none"></textarea>
                
                <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-2 overflow-hidden">
                        <ImageIcon size={14}/> {file ? file.name : "Upload Screenshot"}
                        <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])}/>
                    </label>
                    <button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                        {sending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Kirim
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  )
}

export default Home

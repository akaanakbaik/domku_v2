import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Lock, Save, Camera, Mail, Key, ShieldAlert, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

const Settings = () => {
  const { user, refreshSession } = useOutletContext()
  
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  // State Profile
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || ''
  })

  // State Password
  const [pass, setPass] = useState({ old: '', new: '' })

  if (!user) return null

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })

    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('name', profile.name)
      formData.append('bio', profile.bio)
      formData.append('phone', profile.phone)

      // (Opsional) Jika nanti ada input file untuk avatar:
      // const fileInput = document.getElementById('avatarInput')
      // if (fileInput?.files[0]) {
      //    formData.append('avatar', fileInput.files[0])
      // }
      
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        body: formData // Kirim sebagai FormData
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setMsg({ type: 'success', text: 'Profil berhasil diperbarui!' })
      
      // Update session di localstorage
      const currentSession = JSON.parse(localStorage.getItem('domku_session'))
      const newSession = { ...currentSession, ...data.user }
      localStorage.setItem('domku_session', JSON.stringify(newSession))
      
      refreshSession() // Trigger refresh di layout

    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handlePassUpdate = async (e) => {
    e.preventDefault()
    if(pass.new.length < 6) return alert("Password minimal 6 karakter")
    
    setLoading(true)
    try {
        const res = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: user.email, oldPassword: pass.old, newPassword: pass.new })
        })
        const data = await res.json()
        if(!data.success) throw new Error(data.error)
        
        alert("Password berhasil diubah! Silakan login ulang.")
        setPass({ old: '', new: '' })
    } catch (err) {
        alert(err.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER PROFILE */}
      <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-[#0b0c10] shadow-2xl">
                {user.avatar_url ? <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover"/> : user.name?.charAt(0).toUpperCase()}
            </div>
            {/* Tombol Kamera (Visual Saja untuk saat ini) */}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-2 border-[#0b0c10] cursor-pointer hover:bg-blue-400 transition-colors shadow-lg">
                <Camera size={14}/>
            </div>
        </div>
        
        <div className="text-center md:text-left space-y-2 flex-1">
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm font-mono bg-black/30 inline-flex px-3 py-1 rounded-full border border-white/5">
                <Mail size={12}/> {user.email}
            </div>
            <p className="text-slate-500 text-sm max-w-lg">{user.bio || "Belum ada bio."}</p>
        </div>
      </div>

      {msg.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {msg.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              {msg.text}
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: EDIT PROFILE */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 h-fit">
              <div className="flex items-center gap-2 text-blue-400 mb-2 border-b border-white/5 pb-4">
                  <User size={20}/> <h2 className="font-bold text-lg text-white">Informasi Pribadi</h2>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1">Nama Lengkap</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0b0c10]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:bg-[#0b0c10] outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1">Bio / Deskripsi</label>
                      <input type="text" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#0b0c10]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:bg-[#0b0c10] outline-none transition-all" placeholder="Developer..." />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1">WhatsApp / Phone</label>
                      <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#0b0c10]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:bg-[#0b0c10] outline-none transition-all" placeholder="08..." />
                  </div>
                  <button disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? <RefreshCw size={18} className="animate-spin"/> : <><Save size={18}/> Simpan Perubahan</>}
                  </button>
              </form>
          </div>

          {/* RIGHT: SECURITY & API */}
          <div className="space-y-6">
              
              {/* API Key Card */}
              <div className="glass p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-center justify-between mb-4 border-b border-yellow-500/10 pb-2">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Key size={20}/> <h2 className="font-bold text-lg text-white">API Key Master</h2>
                      </div>
                      <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded font-bold uppercase">Secret</span>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-xl border border-yellow-500/20 relative group hover:border-yellow-500/50 transition-colors">
                      <code className="text-xs sm:text-sm text-slate-300 font-mono break-all leading-relaxed block">{user.api_key}</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5 leading-relaxed">
                    <AlertCircle size={12} className="shrink-0 mt-0.5"/> 
                    Gunakan kunci ini untuk mengakses Endpoint API secara penuh. Jangan bagikan kepada siapapun.
                  </p>
              </div>

              {/* Password Form */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 text-red-400 mb-4 border-b border-white/5 pb-2">
                      <ShieldAlert size={20}/> <h2 className="font-bold text-lg text-white">Ganti Password</h2>
                  </div>
                  <form onSubmit={handlePassUpdate} className="space-y-3">
                      <input type="password" required value={pass.old} onChange={e => setPass({...pass, old: e.target.value})} className="w-full bg-[#0b0c10]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none transition-colors" placeholder="Password Lama" />
                      <input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none transition-colors" placeholder="Password Baru (Min 6 karakter)" />
                      <button disabled={loading} className="w-full py-3 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 hover:border-red-600 rounded-xl font-bold text-sm transition-all mt-2">
                          Update Password
                      </button>
                  </form>
              </div>

          </div>
      </div>
    </div>
  )
}

export default Settings

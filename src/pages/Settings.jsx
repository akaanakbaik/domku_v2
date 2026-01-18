import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Lock, Save, Camera, Mail, Key, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react'

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

      // Cek jika ada file avatar (implementasi input file hidden nanti jika perlu)
      // Di sini kita fokus data teks dulu agar simpel
      
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

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden border-2 border-blue-400 shadow-lg shadow-blue-900/50">
                {user.avatar_url ? <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover"/> : user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full border border-white/20 cursor-pointer hover:bg-blue-600 transition-colors">
                <Camera size={12}/>
            </div>
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-500 text-sm flex items-center gap-1"><Mail size={12}/> {user.email}</p>
        </div>
      </div>

      {msg.text && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-red-900/20 text-red-400 border border-red-500/20'}`}>
              {msg.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              {msg.text}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: PROFILE FORM */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center gap-2 text-blue-400 mb-4 border-b border-white/5 pb-2">
                  <User size={18}/> <h2 className="font-bold text-lg">Edit Profile</h2>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Nama Lengkap</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Bio / Info</label>
                      <input type="text" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all" placeholder="Developer from Indonesia" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Phone (Optional)</label>
                      <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all" placeholder="0812..." />
                  </div>
                  <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                      {loading ? 'Saving...' : <><Save size={16}/> Simpan Perubahan</>}
                  </button>
              </form>
          </div>

          {/* RIGHT: SECURITY & API */}
          <div className="space-y-6">
              
              {/* API Key Card */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-yellow-500 mb-4 border-b border-white/5 pb-2">
                      <Key size={18}/> <h2 className="font-bold text-lg">API Access</h2>
                  </div>
                  <div className="bg-black/50 p-3 rounded-lg border border-yellow-500/20 relative group">
                      <code className="text-xs text-slate-300 font-mono break-all">{user.api_key}</code>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">SECRET</span>
                      </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Jangan bagikan API Key ini kepada siapapun.</p>
              </div>

              {/* Password Form */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 text-red-400 mb-4 border-b border-white/5 pb-2">
                      <ShieldAlert size={18}/> <h2 className="font-bold text-lg">Keamanan</h2>
                  </div>
                  <form onSubmit={handlePassUpdate} className="space-y-3">
                      <input type="password" required value={pass.old} onChange={e => setPass({...pass, old: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-red-500 outline-none" placeholder="Password Lama" />
                      <input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-red-500 outline-none" placeholder="Password Baru (Min 6)" />
                      <button disabled={loading} className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 border border-red-600/30 rounded-xl font-bold text-sm transition-all">
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

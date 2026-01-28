import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Lock, Save, Camera, Mail, ShieldAlert, Loader2, Trash2, BadgeCheck, Star, Smartphone, FileText, CheckCircle2, Shield, AlertOctagon, Eye, EyeOff, Key, Copy, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
  const outletContext = useOutletContext()
  const authContext = useAuth()
  
  // FIX: Fallback context
  const user = outletContext?.user || authContext?.user
  const { refreshSession } = authContext
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ name: '', bio: '', phone: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  const [pass, setPass] = useState({ old: '', new: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const [userStatus, setUserStatus] = useState({ label: 'Regular User', color: 'slate' })

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', bio: user.bio || '', phone: user.phone || '' })
      setAvatarPreview(user.avatar_url)

      const isAdmin = user.email === 'khaliqarrasyidabdul@gmail.com'
      const createdDate = new Date(user.created_at)
      const now = new Date()
      const diffTime = Math.abs(now - createdDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (isAdmin) {
        setUserStatus({ label: 'ADMINISTRATOR', color: 'blue' })
      } else if (diffDays <= 3) {
        setUserStatus({ label: 'NEW MEMBER', color: 'green' })
      } else {
        setUserStatus({ label: 'VERIFIED USER', color: 'slate' })
      }
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return addToast('warning', 'Maksimal 2MB')
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('domku_token')}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio
        })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      addToast('success', 'Profil berhasil diperbarui')
      if (refreshSession) refreshSession()
      
    } catch (err) {
      addToast('error', err.message || 'Gagal update profil')
    } finally {
      setLoading(false)
    }
  }

  const handlePassUpdate = async (e) => {
    e.preventDefault()
    if(pass.new.length < 6) return addToast('warning', "Password min 6 karakter")

    setLoading(true)
    try {
        const res = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: user.email, oldPassword: pass.old, newPassword: pass.new })
        })
        const data = await res.json()
        if(!data.success) throw new Error(data.error)

        addToast('success', "Password berhasil diubah")
        setPass({ old: '', new: '' })
    } catch (err) {
        addToast('error', err.message)
    } finally {
        setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
        const res = await fetch('/api/user/delete-account', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json', 'X-API-Key': user.api_key},
            body: JSON.stringify({ password: deleteConfirm })
        })
        const data = await res.json()
        if(!data.success) throw new Error(data.error)

        addToast('success', "Akun berhasil dihapus permanen")
        localStorage.removeItem('domku_session')
        window.location.href = '/auth'
    } catch(err) {
        addToast('error', err.message)
        setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    addToast('success', 'Disalin ke clipboard')
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">

      <div className="bg-[#111318]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 shadow-xl shadow-blue-500/20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center text-3xl font-bold text-white relative">
                         {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/> : user.name?.charAt(0).toUpperCase()}
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => fileInputRef.current.click()}>
                            <Camera size={24} className="text-white drop-shadow-md"/>
                         </div>
                    </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="text-center md:text-left flex-1 min-w-0 space-y-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white truncate tracking-tight flex items-center justify-center md:justify-start gap-2">
                        {user.name}
                        {userStatus.label === 'ADMINISTRATOR' && <BadgeCheck className="text-blue-500 fill-blue-500/10 shrink-0" size={24} />}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <Mail size={12} className="text-slate-500"/>
                        <span className="text-xs text-slate-400 font-mono">{user.email}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide shadow-sm ${
                        userStatus.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        userStatus.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-slate-700/30 text-slate-300 border-slate-600/30'
                    }`}>
                        {userStatus.color === 'blue' ? <Shield size={12}/> : userStatus.color === 'green' ? <Star size={12}/> : <CheckCircle2 size={12}/>}
                        {userStatus.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="space-y-6">
              <section className="bg-[#111318] p-6 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><User size={20}/></div>
                      <div>
                          <h2 className="font-bold text-base text-white">Edit Profil</h2>
                          <p className="text-[11px] text-slate-500">Perbarui informasi publik Anda</p>
                      </div>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                      <div className="space-y-1.5 group/input">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors">Nama Lengkap</label>
                          <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder-slate-700 shadow-inner" placeholder="John Doe" />
                      </div>
                      <div className="space-y-1.5 group/input">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors">No. Telepon</label>
                          <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder-slate-700 shadow-inner" placeholder="+62..." />
                      </div>
                      <div className="space-y-1.5 group/input">
                        <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors">Bio Singkat</label>
                        <textarea rows="3" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none resize-none transition-all placeholder-slate-700 shadow-inner" placeholder="Ceritakan sedikit tentang Anda..." />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95 group/btn">
                            {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} className="group-hover/btn:scale-110 transition-transform"/>} Simpan Perubahan
                        </button>
                      </div>
                  </form>
              </section>

              <section className="bg-[#111318] p-5 rounded-2xl border border-white/5 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"><Key size={100}/></div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500"><Key size={16}/></div>
                      <div>
                          <h2 className="font-bold text-sm text-white">Akses API</h2>
                          <p className="text-[10px] text-slate-500">Kunci akses programatik</p>
                      </div>
                  </div>
                  <div className="bg-[#0b0c10] p-3 rounded-xl border border-white/10 relative group/code">
                      <div className="text-[9px] text-slate-500 uppercase font-bold mb-1.5 flex justify-between items-center">
                          Master Key <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">RAHASIA</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-[10px] text-yellow-100/90 font-mono break-all block selection:bg-yellow-500/30 leading-relaxed truncate">
                            {showKey ? user.api_key : '•'.repeat(24)}
                        </code>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                                {showKey ? <EyeOff size={12}/> : <Eye size={12}/>}
                            </button>
                            <button onClick={() => copyToClipboard(user.api_key)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                                <Copy size={12}/>
                            </button>
                        </div>
                      </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 bg-yellow-900/10 p-2.5 rounded-lg border border-yellow-500/10">
                      <AlertTriangle size={12} className="text-yellow-500 shrink-0 mt-0.5"/>
                      <p className="text-[9px] text-yellow-200/70 leading-relaxed">Hubungi admin jika Anda perlu memperbarui/mengganti API Key ini.</p>
                  </div>
              </section>
          </div>

          <div className="space-y-6">
              <section className="bg-[#111318] p-6 rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                      <div className="p-2 bg-slate-800 rounded-xl text-slate-300"><Lock size={20}/></div>
                      <div>
                          <h2 className="font-bold text-base text-white">Keamanan</h2>
                          <p className="text-[11px] text-slate-500">Ubah kata sandi akun</p>
                      </div>
                  </div>
                  <form onSubmit={handlePassUpdate} className="space-y-4">
                      <div className="space-y-1.5 group/input relative">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 group-focus-within/input:text-white transition-colors">Password Lama</label>
                          <input type={showPassword ? "text" : "password"} required value={pass.old} onChange={e => setPass({...pass, old: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white/30 outline-none transition-all placeholder-slate-700" placeholder="••••••••" />
                      </div>
                      <div className="space-y-1.5 group/input relative">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 group-focus-within/input:text-white transition-colors">Password Baru</label>
                          <input type={showPassword ? "text" : "password"} required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white/30 outline-none transition-all placeholder-slate-700" placeholder="Min. 6 karakter" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-500 hover:text-white transition-colors">
                              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                      </div>
                      <button disabled={loading} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-all border border-white/5 hover:border-white/20 mt-2 active:scale-95">Update Password</button>
                  </form>
              </section>

              <section className="bg-[#111318] p-6 rounded-3xl border border-red-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500"><ShieldAlert size={20}/></div>
                        <div>
                            <h2 className="font-bold text-base text-white">Zona Bahaya</h2>
                            <p className="text-[11px] text-red-400/70">Area sensitif akun</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0b0c10] border border-red-500/10 rounded-2xl relative z-10">
                        <div className="text-center sm:text-left">
                            <h4 className="text-red-200 font-bold text-xs">Hapus Akun</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs leading-tight">Semua data akan hilang permanen.</p>
                        </div>
                        <button onClick={() => setShowDeleteModal(true)} className="px-5 py-2.5 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold rounded-xl transition-all whitespace-nowrap border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-900/10 active:scale-95">Hapus Permanen</button>
                    </div>
              </section>
          </div>
      </div>

      {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-200">
              <div className="bg-[#111318] border border-red-500/30 p-6 rounded-3xl max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
                  <div className="flex flex-col items-center gap-3 text-center mb-6 pt-2">
                      <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                          <AlertOctagon size={32} className="text-red-500"/>
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Konfirmasi Akhir</h3>
                          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed px-2">
                              Tindakan ini akan <span className="text-red-400 font-bold">menghapus permanen</span> semua data, subdomain, dan log aktivitas Anda.
                          </p>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <input type="password" placeholder="Konfirmasi dengan Password" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="w-full bg-black/40 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-white focus:border-red-500 outline-none text-center placeholder-slate-600 transition-colors font-bold tracking-widest"/>
                      <div className="flex gap-2">
                          <button onClick={() => {setShowDeleteModal(false); setDeleteConfirm('')}} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold text-xs transition-colors border border-white/5">Batal</button>
                          <button onClick={handleDeleteAccount} disabled={loading || !deleteConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-600/20">
                              {loading ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>} Hapus Akun
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default Settings
import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Lock, Save, Camera, Mail, Key, ShieldAlert, Loader2, Trash2, AlertTriangle, BadgeCheck, Star, Clock, Smartphone, FileText, CheckCircle2, Shield, AlertOctagon } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const Settings = () => {
  const { user, refreshSession } = useOutletContext()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ name: '', bio: '', phone: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  const [pass, setPass] = useState({ old: '', new: '' })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [userStatus, setUserStatus] = useState({ label: 'Regular User', color: 'slate' })
  const isAdmin = user?.email === 'khaliqarrasyidabdul@gmail.com'

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', bio: user.bio || '', phone: user.phone || '' })
      setAvatarPreview(user.avatar_url)

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
  }, [user, isAdmin])

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
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('name', profile.name)
      formData.append('bio', profile.bio)
      formData.append('phone', profile.phone)
      if (avatarFile) formData.append('avatar', avatarFile)

      const res = await fetch('/api/user/update-profile', { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      addToast('success', 'Profil berhasil diperbarui')

      const currentSession = JSON.parse(localStorage.getItem('domku_session'))
      localStorage.setItem('domku_session', JSON.stringify({ ...currentSession, ...data.user }))
      refreshSession()
    } catch (err) {
      addToast('error', err.message)
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

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 px-3 md:px-6">

      <div className="bg-[#111318]/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="relative group shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 shadow-md shadow-blue-500/10">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center text-2xl font-bold text-white relative">
                         {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/> : user.name?.charAt(0).toUpperCase()}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <Camera size={20} className="text-white drop-shadow-md"/>
                         </div>
                    </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="text-center md:text-left flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-xl md:text-2xl font-black text-white truncate tracking-tight">{user.name}</h1>
                    {isAdmin && <BadgeCheck className="text-blue-500 fill-blue-500/10 shrink-0 animate-pulse" size={18} />}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] text-slate-300 font-medium">
                        <Mail size={10} className="text-slate-500"/> {user.email}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wide shadow-sm ${
                        userStatus.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        userStatus.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-slate-700/30 text-slate-300 border-slate-600/30'
                    }`}>
                        {userStatus.color === 'blue' ? <Shield size={10}/> : userStatus.color === 'green' ? <Star size={10}/> : <CheckCircle2 size={10}/>}
                        {userStatus.label}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 space-y-4">

              <section className="bg-[#111318] p-5 rounded-2xl border border-white/5 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"><User size={100}/></div>
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><User size={16}/></div>
                      <div>
                          <h2 className="font-bold text-sm text-white">Informasi Pribadi</h2>
                          <p className="text-[10px] text-slate-500">Perbarui detail profil publik Anda</p>
                      </div>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-4 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 group/input">
                            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors"><User size={10}/> Nama Lengkap</label>
                            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all placeholder-slate-700 shadow-inner" placeholder="John Doe" />
                        </div>
                        <div className="space-y-1 group/input">
                            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors"><Smartphone size={10}/> No. Telepon</label>
                            <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all placeholder-slate-700 shadow-inner" placeholder="+62..." />
                        </div>
                      </div>
                      <div className="space-y-1 group/input">
                        <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1.5 group-focus-within/input:text-blue-400 transition-colors"><FileText size={10}/> Bio</label>
                        <textarea rows="3" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none resize-none transition-all placeholder-slate-700 shadow-inner" placeholder="Ceritakan sedikit tentang Anda..." />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all active:scale-95 group/btn">
                            {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} className="group-hover/btn:scale-110 transition-transform"/>} Simpan
                        </button>
                      </div>
                  </form>
              </section>

              <section className="bg-[#111318] p-5 rounded-2xl border border-red-500/20 shadow-md relative overflow-hidden">
                   <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                   <div className="flex items-center gap-3 mb-5 relative z-10">
                       <div className="p-1.5 bg-red-500/10 rounded-lg text-red-500"><ShieldAlert size={16}/></div>
                       <div>
                           <h2 className="font-bold text-sm text-white">Zona Bahaya</h2>
                           <p className="text-[10px] text-red-400/70">Tindakan ini tidak dapat dibatalkan</p>
                       </div>
                   </div>
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0b0c10] border border-red-500/10 rounded-xl relative z-10">
                        <div className="text-center sm:text-left">
                            <h4 className="text-red-200 font-bold text-xs">Hapus Akun</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs leading-tight">Data akun dan subdomain akan dihapus permanen.</p>
                        </div>
                        <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-900/10">Hapus Permanen</button>
                   </div>
              </section>
          </div>

          <div className="space-y-4">

              <section className="bg-[#111318] p-5 rounded-2xl border border-white/5 shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"><Key size={100}/></div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500"><Key size={16}/></div>
                      <div>
                          <h2 className="font-bold text-sm text-white">Akses API</h2>
                          <p className="text-[10px] text-slate-500">Kelola kunci akses programatik</p>
                      </div>
                  </div>
                  <div className="bg-[#0b0c10] p-3 rounded-xl border border-white/5 relative group/code">
                      <div className="text-[9px] text-slate-500 uppercase font-bold mb-1.5 flex justify-between items-center">
                          Master Key <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">RAHASIA</span>
                      </div>
                      <code className="text-[10px] text-yellow-100/90 font-mono break-all block selection:bg-yellow-500/30 leading-relaxed opacity-70 group-hover/code:opacity-100 transition-opacity">{user.api_key}</code>
                  </div>
                  <div className="mt-3 flex items-start gap-2 bg-yellow-900/10 p-2.5 rounded-lg border border-yellow-500/10">
                      <AlertTriangle size={12} className="text-yellow-500 shrink-0 mt-0.5"/>
                      <p className="text-[9px] text-yellow-200/70 leading-relaxed">Jaga kerahasiaan kunci ini. Pemegang kunci dapat mengontrol DNS Anda.</p>
                  </div>
              </section>

              <section className="bg-[#111318] p-5 rounded-2xl border border-white/5 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 bg-slate-800 rounded-lg text-slate-300"><Lock size={16}/></div>
                      <div>
                          <h2 className="font-bold text-sm text-white">Keamanan</h2>
                          <p className="text-[10px] text-slate-500">Perbarui kata sandi akun</p>
                      </div>
                  </div>
                  <form onSubmit={handlePassUpdate} className="space-y-3">
                      <div className="space-y-1 group/input">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 group-focus-within/input:text-white transition-colors">Password Lama</label>
                          <input type="password" required value={pass.old} onChange={e => setPass({...pass, old: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition-all placeholder-slate-700" placeholder="••••••••" />
                      </div>
                      <div className="space-y-1 group/input">
                          <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 group-focus-within/input:text-white transition-colors">Password Baru</label>
                          <input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/30 outline-none transition-all placeholder-slate-700" placeholder="Min. 6 karakter" />
                      </div>
                      <button disabled={loading} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-[10px] transition-all border border-white/5 hover:border-white/20 mt-1 active:scale-95">Update Password</button>
                  </form>
              </section>
          </div>
      </div>

      {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-200">
              <div className="bg-[#111318] border border-red-500/30 p-6 rounded-2xl max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <div className="flex flex-col items-center gap-3 text-center mb-5">
                      <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                          <AlertOctagon size={24} className="text-red-500"/>
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">Konfirmasi Akhir</h3>
                          <p className="text-slate-400 text-[10px] mt-1 leading-relaxed px-2">
                              Tindakan ini akan <span className="text-red-400 font-bold">menghapus permanen</span> semua data, subdomain, dan log aktivitas Anda.
                          </p>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <input type="password" placeholder="Konfirmasi dengan Password" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="w-full bg-black/40 border border-red-500/30 rounded-lg px-3 py-2.5 text-xs text-white focus:border-red-500 outline-none text-center placeholder-slate-600 transition-colors"/>
                      <div className="flex gap-2">
                          <button onClick={() => {setShowDeleteModal(false); setDeleteConfirm('')}} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-bold text-[10px] transition-colors border border-white/5">Batal</button>
                          <button onClick={handleDeleteAccount} disabled={loading || !deleteConfirm} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-600/20">
                              {loading ? <Loader2 size={12} className="animate-spin"/> : <Trash2 size={12}/>} Hapus Akun
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

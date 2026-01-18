import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Lock, Save, Camera, Mail, Key, ShieldAlert, Loader2, Trash2, AlertTriangle } from 'lucide-react'
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

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', bio: user.bio || '', phone: user.phone || '' })
      setAvatarPreview(user.avatar_url)
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return addToast('warning', 'Ukuran maksimal foto 2MB')
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

      addToast('success', 'Profil berhasil diperbarui!')
      
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
    if(pass.new.length < 6) return addToast('warning', "Password minimal 6 karakter")
    
    setLoading(true)
    try {
        const res = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: user.email, oldPassword: pass.old, newPassword: pass.new })
        })
        const data = await res.json()
        if(!data.success) throw new Error(data.error)
        
        addToast('success', "Password diubah. Silakan login ulang.")
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

        addToast('success', "Akun berhasil dihapus selamanya.")
        localStorage.removeItem('domku_session')
        window.location.href = '/auth'
    } catch(err) {
        addToast('error', err.message)
        setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-blue-900/20">
        <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-[#0b0c10] shadow-2xl ring-2 ring-blue-500/50">
                {avatarPreview ? <img src={avatarPreview} alt="Av" className="w-full h-full object-cover"/> : user.name?.charAt(0).toUpperCase()}
            </div>
            <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-[#0b0c10] hover:bg-blue-500 transition-colors shadow-lg"><Camera size={14}/></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1.5 mt-1"><Mail size={14}/> {user.email}</p>
            <div className="flex gap-2 mt-3 justify-center md:justify-start">
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/20">PRO USER</span>
                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20">VERIFIED</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              {/* Profile Form */}
              <section className="bg-[#111318] p-6 rounded-2xl border border-blue-900/20">
                  <div className="flex items-center gap-2 mb-6"><User className="text-blue-500" size={20}/> <h2 className="font-bold text-lg text-white">Informasi Profil</h2></div>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs text-slate-500 font-bold uppercase ml-1">Nama Lengkap</label><input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" /></div>
                        <div className="space-y-1"><label className="text-xs text-slate-500 font-bold uppercase ml-1">Nomor Telepon</label><input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="+62..." /></div>
                      </div>
                      <div className="space-y-1"><label className="text-xs text-slate-500 font-bold uppercase ml-1">Bio / Deskripsi</label><textarea rows="3" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none resize-none" placeholder="Ceritakan sedikit tentang Anda..." /></div>
                      <div className="pt-2"><button disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm transition-all">{loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan Profil</button></div>
                  </form>
              </section>

              {/* Danger Zone */}
              <section className="bg-[#111318] p-6 rounded-2xl border border-blue-900/20">
                   <div className="flex items-center gap-2 mb-6"><ShieldAlert className="text-red-500" size={20}/> <h2 className="font-bold text-lg text-white">Zona Berbahaya</h2></div>
                   <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                        <div>
                            <h4 className="text-white font-bold text-sm">Hapus Akun Permanen</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-md">Menghapus semua data, subdomain, dan log. Tidak bisa dibatalkan.</p>
                        </div>
                        <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">Hapus Akun</button>
                   </div>
              </section>
          </div>

          <div className="space-y-8">
              {/* API Access */}
              <section className="bg-[#111318] p-6 rounded-2xl border border-blue-900/20 h-fit">
                  <div className="flex items-center gap-2 mb-6"><Key className="text-yellow-500" size={20}/> <h2 className="font-bold text-lg text-white">API Access</h2></div>
                  <div className="bg-[#0b0c10] p-4 rounded-xl border border-blue-900/30 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-bl-lg">MASTER KEY</div>
                      <code className="text-xs text-slate-300 font-mono break-all block mt-2">{user.api_key}</code>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 text-center">Rahasiakan API Key ini.</p>
              </section>

              {/* Change Password */}
              <section className="bg-[#111318] p-6 rounded-2xl border border-blue-900/20 h-fit">
                  <div className="flex items-center gap-2 mb-6"><Lock className="text-slate-400" size={20}/> <h2 className="font-bold text-lg text-white">Ganti Password</h2></div>
                  <form onSubmit={handlePassUpdate} className="space-y-4">
                      <input type="password" required value={pass.old} onChange={e => setPass({...pass, old: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="Password Lama" />
                      <input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="Password Baru" />
                      <button disabled={loading} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all border border-white/5">Update Password</button>
                  </form>
              </section>
          </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-[#16181d] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3 text-red-500 mb-4">
                      <div className="p-3 bg-red-500/10 rounded-full"><AlertTriangle size={24}/></div>
                      <h3 className="text-xl font-bold text-white">Konfirmasi Hapus</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      Ketik password Anda untuk mengonfirmasi penghapusan akun. <br/>
                      <span className="text-red-400 font-bold">Semua data akan hilang selamanya.</span>
                  </p>
                  <input type="password" placeholder="Masukkan password Anda" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none mb-4"/>
                  <div className="flex gap-3">
                      <button onClick={() => {setShowDeleteModal(false); setDeleteConfirm('')}} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700">Batal</button>
                      <button onClick={handleDeleteAccount} disabled={loading || !deleteConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                          {loading ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>} Hapus
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default Settings

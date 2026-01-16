import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, Key, Lock, Upload, Copy, ShieldAlert } from 'lucide-react'
import Loader from '../components/Loader'

const Settings = () => {
  const { user, refreshSession } = useOutletContext() || {} // Safety check
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  // State form
  const [newName, setNewName] = useState('')
  const [previewImg, setPreviewImg] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  const [passData, setPassData] = useState({ old: '', new: '' })
  const [resetStep, setResetStep] = useState(0)
  const [resetOtp, setResetOtp] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')
  
  const fileInputRef = useRef(null)

  // Efek Sinkronisasi Data User
  useEffect(() => {
    if (user) {
      setNewName(user.name || '')
      setPreviewImg(user.avatar_url || null)
    }
  }, [user])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  // --- HANDLERS (Sama seperti sebelumnya, disingkat agar muat) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileToUpload(file)
      setPreviewImg(URL.createObjectURL(file))
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('name', newName)
      if (fileToUpload) formData.append('avatar', fileToUpload)

      const res = await fetch('/api/user/update-profile', { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      localStorage.setItem('domku_session', JSON.stringify({ ...user, ...data.user }))
      if (refreshSession) refreshSession()
      
      showMsg('success', 'Profil diperbarui!')
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, oldPassword: passData.old, newPassword: passData.new })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showMsg('success', 'Password berhasil diubah!')
      setPassData({ old: '', new: '' })
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- RENDER UTAMA ---
  
  // JIKA USER BELUM SIAP (Mencegah Blank Page)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader />
        <p className="mt-4 text-slate-500">Memuat data pengguna...</p>
      </div>
    )
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-white">Pengaturan Akun</h1>
      </div>

      {msg.text && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border ${msg.type === 'error' ? 'bg-[#1a1d24] border-red-500 text-red-400' : 'bg-[#1a1d24] border-green-500 text-green-400'}`}>
          <span className="font-bold">{msg.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-blue-500"/> Profil Saya</h2>
        <form onSubmit={updateProfile} className="space-y-6">
          <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="border-2 border-dashed border-blue-900/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-900/10 transition-colors">
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            <div className="relative">
              {previewImg ? <img src={previewImg} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-blue-600" /> : <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">{user.name?.charAt(0).toUpperCase()}</div>}
              <div className="absolute bottom-0 right-0 bg-white text-blue-600 p-1.5 rounded-full shadow-lg"><Upload size={14}/></div>
            </div>
            <p className="text-slate-400 text-sm">Ganti Foto Profil</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Nama</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Simpan</button>
        </form>
      </div>

      {/* API Key */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Key className="text-yellow-500"/> API Key</h2>
        <div className="bg-black/40 border border-blue-900/20 p-4 rounded-xl flex items-center justify-between gap-4">
          <code className="text-blue-300 font-mono text-sm break-all">{user.api_key}</code>
          <button onClick={() => { navigator.clipboard.writeText(user.api_key); showMsg('success', 'Tersalin!') }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Copy size={20}/></button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lock className="text-green-500"/> Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="password" placeholder="Password Lama" value={passData.old} onChange={(e) => setPassData({...passData, old: e.target.value})} className="bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
             <input type="password" placeholder="Password Baru" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold">Ubah Password</button>
        </form>
      </div>
    </div>
  )
}

export default Settings

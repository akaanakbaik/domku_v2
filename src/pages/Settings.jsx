import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, Key, Lock, Upload, Copy, Check, ShieldAlert } from 'lucide-react'
import Loader from '../components/Loader'

const Settings = () => {
  const context = useOutletContext()
  const user = context?.user
  const refreshSession = context?.refreshSession
  
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

  useEffect(() => {
    if (user) {
      setNewName(user.name || '')
      setPreviewImg(user.avatar_url || null)
    }
  }, [user])

  // Cegah render jika user null (tunggu Layout)
  if (!user) {
    return <div className="text-center py-20 text-slate-500">Memuat data pengguna...</div>
  }

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return showMsg('error', 'Ukuran max 2MB')
      setFileToUpload(file)
      setPreviewImg(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return showMsg('error', 'Ukuran max 2MB')
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

      // Update LocalStorage & Session UI
      const newUser = { ...user, ...data.user }
      localStorage.setItem('domku_session', JSON.stringify(newUser))
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

  const requestReset = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResetStep(1)
      showMsg('success', 'OTP dikirim ke email.')
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: resetOtp, newPassword: resetNewPass })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      setResetStep(0)
      setResetOtp('')
      setResetNewPass('')
      showMsg('success', 'Password berhasil direset!')
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600/20 p-3 rounded-full text-blue-500"><UserCog size={32} /></div>
        <h1 className="text-3xl font-bold text-white">Pengaturan Akun</h1>
      </div>

      {msg.text && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${msg.type === 'error' ? 'bg-[#1a1d24] border-red-500 text-red-400' : 'bg-[#1a1d24] border-green-500 text-green-400'}`}>
          <span className="font-bold">{msg.text}</span>
        </div>
      )}

      {/* 1. PROFILE & AVATAR */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-blue-500"/> Profil Saya</h2>
        
        <form onSubmit={updateProfile} className="space-y-6">
          <div 
            className="border-2 border-dashed border-blue-900/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-900/10 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            <div className="relative">
              {previewImg ? (
                <img src={previewImg} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-white text-blue-600 p-1.5 rounded-full shadow-lg"><Upload size={14}/></div>
            </div>
            <p className="text-slate-400 text-sm">Klik atau Drag & Drop foto di sini (Max 2MB)</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Nama Lengkap</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white focus:border-blue-500" />
          </div>

          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">Simpan Profil</button>
        </form>
      </div>

      {/* 2. API KEY */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Key className="text-yellow-500"/> API Key</h2>
        <div className="bg-black/40 border border-blue-900/20 p-4 rounded-xl flex items-center justify-between gap-4 group">
          <code className="text-blue-300 font-mono text-sm break-all">{user.api_key}</code>
          <button onClick={() => { navigator.clipboard.writeText(user.api_key); showMsg('success', 'Tersalin!') }} className="p-2 bg-white/5 group-hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Copy size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">API Key ini bersifat rahasia.</p>
      </div>

      {/* 3. CHANGE PASSWORD */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lock className="text-green-500"/> Keamanan Akun</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-sm text-slate-400">Password Lama</label>
               <input type="password" value={passData.old} onChange={(e) => setPassData({...passData, old: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
             </div>
             <div>
               <label className="text-sm text-slate-400">Password Baru</label>
               <input type="password" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
             </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button type="button" onClick={() => setResetStep(resetStep === 0 ? 99 : 0) || requestReset()} className="text-sm text-red-400 hover:underline">Lupa password lama?</button>
            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">Ubah Password</button>
          </div>
        </form>

        {resetStep === 1 && (
          <div className="mt-6 pt-6 border-t border-blue-900/20 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><ShieldAlert size={18}/> Reset Password via OTP</h3>
            <form onSubmit={confirmReset} className="space-y-4">
              <div>
                 <label className="text-sm text-slate-400">Kode OTP (Cek Email)</label>
                 <input type="text" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} className="w-full bg-[#0b0c10] border border-red-900/30 rounded-xl p-3 text-white text-center tracking-widest font-bold text-lg" placeholder="0000" />
              </div>
              <div>
                 <label className="text-sm text-slate-400">Password Baru</label>
                 <input type="password" value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} className="w-full bg-[#0b0c10] border border-red-900/30 rounded-xl p-3 text-white" />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">Reset Password Sekarang</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings

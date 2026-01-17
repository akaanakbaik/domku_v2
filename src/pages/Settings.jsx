import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, Key, Lock, Upload, Copy, ShieldAlert, Monitor, Globe, Trash2, Calendar, Hash } from 'lucide-react'
import Loader from '../components/Loader'

const Settings = () => {
  const context = useOutletContext()
  const user = context?.user
  const refreshSession = context?.refreshSession
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  const [newName, setNewName] = useState('')
  const [previewImg, setPreviewImg] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  
  const [passData, setPassData] = useState({ old: '', new: '' })
  const [resetStep, setResetStep] = useState(0)
  const [resetOtp, setResetOtp] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')

  // INFO BARU
  const [ipAddress, setIpAddress] = useState('Memuat...')
  const [deviceInfo, setDeviceInfo] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setNewName(user.name || '')
      setPreviewImg(user.avatar_url || null)
      
      // Ambil IP
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => setIpAddress(data.ip))
        .catch(() => setIpAddress('Gagal memuat'))

      // Ambil Info Perangkat Sederhana
      const ua = navigator.userAgent
      let os = "Unknown OS"
      if (ua.indexOf("Win") !== -1) os = "Windows"
      if (ua.indexOf("Mac") !== -1) os = "MacOS"
      if (ua.indexOf("Linux") !== -1) os = "Linux"
      if (ua.indexOf("Android") !== -1) os = "Android"
      if (ua.indexOf("like Mac") !== -1) os = "iOS"
      setDeviceInfo(`${os} - ${navigator.vendor || 'Browser'}`)
    }
  }, [user])

  if (!user) {
    return <div className="flex justify-center pt-20"><Loader /></div>
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
        <h1 className="text-3xl font-bold text-white">Pengaturan Akun</h1>
      </div>

      {msg.text && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border ${msg.type === 'error' ? 'bg-[#1a1d24] border-red-500 text-red-400' : 'bg-[#1a1d24] border-green-500 text-green-400'}`}>
          <span className="font-bold">{msg.text}</span>
        </div>
      )}

      {/* 1. INFORMASI AKUN (BARU) */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Monitor className="text-cyan-500"/> Sesi & Perangkat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm"><Globe size={14}/> IP Address Anda</div>
            <div className="text-white font-mono text-lg">{ipAddress}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm"><Monitor size={14}/> Perangkat Saat Ini</div>
             <div className="text-white font-medium">{deviceInfo}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm"><Calendar size={14}/> Bergabung Sejak</div>
             <div className="text-white font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</div>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm"><Hash size={14}/> User ID</div>
             <div className="text-white font-mono text-xs break-all">{user.id}</div>
          </div>
        </div>
      </div>

      {/* 2. PROFILE & AVATAR */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-blue-500"/> Profil Saya</h2>
        <form onSubmit={updateProfile} className="space-y-6">
          <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="border-2 border-dashed border-blue-900/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-900/10 transition-colors">
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            <div className="relative">
              {previewImg ? <img src={previewImg} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-xl" /> : <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">{user.name?.charAt(0).toUpperCase()}</div>}
              <div className="absolute bottom-0 right-0 bg-white text-blue-600 p-1.5 rounded-full shadow-lg"><Upload size={14}/></div>
            </div>
            <p className="text-slate-400 text-sm">Klik atau Drag & Drop foto di sini (Max 2MB)</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Nama Lengkap</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Simpan Profil</button>
        </form>
      </div>

      {/* 3. API KEY */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Key className="text-yellow-500"/> API Key</h2>
        <div className="bg-black/40 border border-blue-900/20 p-4 rounded-xl flex items-center justify-between gap-4 group">
          <code className="text-blue-300 font-mono text-sm break-all">{user.api_key}</code>
          <button onClick={() => { navigator.clipboard.writeText(user.api_key); showMsg('success', 'Tersalin!') }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Copy size={20}/></button>
        </div>
      </div>

      {/* 4. PASSWORD */}
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lock className="text-green-500"/> Keamanan Akun</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="password" placeholder="Password Lama" value={passData.old} onChange={(e) => setPassData({...passData, old: e.target.value})} className="bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
             <input type="password" placeholder="Password Baru" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} className="bg-[#0b0c10] border border-blue-900/30 rounded-xl p-3 text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold">Ubah Password</button>
        </form>

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end mt-2">
           <button type="button" onClick={() => setResetStep(resetStep === 0 ? 1 : 0) || requestReset()} className="text-sm text-red-400 hover:underline">Lupa password lama?</button>
        </div>

        {resetStep === 1 && (
          <div className="mt-4 pt-4 border-t border-blue-900/20 animate-in fade-in">
            <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><ShieldAlert size={18}/> Reset Password via OTP</h3>
            <form onSubmit={confirmReset} className="space-y-4">
              <input type="text" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} className="w-full bg-[#0b0c10] border border-red-900/30 rounded-xl p-3 text-white text-center tracking-widest font-bold" placeholder="0000" />
              <input type="password" placeholder="Password Baru" value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} className="w-full bg-[#0b0c10] border border-red-900/30 rounded-xl p-3 text-white" />
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">Reset Sekarang</button>
            </form>
          </div>
        )}
      </div>

      {/* 5. DANGER ZONE (UI ONLY) */}
      <div className="border border-red-900/30 rounded-2xl p-6 bg-red-900/5">
        <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2"><Trash2 size={20}/> Zona Bahaya</h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">Menghapus akun akan menghilangkan semua data subdomain Anda secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
          <button disabled className="px-6 py-2 bg-red-900/20 border border-red-900/50 text-red-500 rounded-lg font-bold cursor-not-allowed opacity-70">Hapus Akun</button>
        </div>
      </div>

    </div>
  )
}

export default Settings

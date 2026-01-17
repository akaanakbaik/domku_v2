import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, Key, Lock, Upload, Copy, ShieldAlert, Monitor, Globe, Trash2, Calendar, Smartphone, Edit3, Bell, Save } from 'lucide-react'
import Loader from '../components/Loader'

const Settings = () => {
  const context = useOutletContext()
  const user = context?.user
  const refreshSession = context?.refreshSession
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  
  // Form States
  const [newName, setNewName] = useState('')
  const [newBio, setNewBio] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [previewImg, setPreviewImg] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  
  const [passData, setPassData] = useState({ old: '', new: '' })
  const [resetStep, setResetStep] = useState(0)
  const [resetOtp, setResetOtp] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')

  // Info System
  const [ipAddress, setIpAddress] = useState('Loading...')
  const [deviceInfo, setDeviceInfo] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setNewName(user.name || '')
      setNewBio(user.bio || '')
      setNewPhone(user.phone || '')
      setPreviewImg(user.avatar_url || null)
      
      // IP & Device Check
      fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => setIpAddress(d.ip)).catch(() => setIpAddress('Hidden'))
      setDeviceInfo(navigator.platform || 'Unknown Device')
    }
  }, [user])

  if (!user) return <div className="flex justify-center pt-20"><Loader /></div>

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size < 2 * 1024 * 1024) {
      setFileToUpload(file)
      setPreviewImg(URL.createObjectURL(file))
    } else {
      showMsg('error', 'File terlalu besar (Max 2MB)')
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('name', newName)
      formData.append('bio', newBio)
      formData.append('phone', newPhone)
      if (fileToUpload) formData.append('avatar', fileToUpload)

      const res = await fetch('/api/user/update-profile', { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      localStorage.setItem('domku_session', JSON.stringify({ ...user, ...data.user }))
      if (refreshSession) refreshSession()
      showMsg('success', 'Profil disimpan!')
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
      showMsg('success', 'Password diubah!')
      setPassData({ old: '', new: '' })
    } catch (err) {
      showMsg('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- COMPACT UI COMPONENTS ---
  
  const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
      <Icon size={14} className="text-blue-500" /> {title}
    </h3>
  )

  const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-700" 
        placeholder={placeholder}
      />
    </div>
  )

  if (loading) return <Loader />

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Toast Notification */}
      {msg.text && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-2xl border text-xs font-bold flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 'bg-green-900/90 border-green-500 text-white'}`}>
          {msg.type === 'error' ? <ShieldAlert size={14}/> : <User size={14}/>} {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PROFILE CARD (Sticky on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-600/20 to-transparent"></div>
            
            <div className="relative inline-block mb-4 group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
              {previewImg ? (
                <img src={previewImg} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[#111318] shadow-xl group-hover:opacity-80 transition-opacity" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-[#111318] shadow-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full shadow-lg border-2 border-[#111318]"><Edit3 size={12}/></div>
            </div>

            <h1 className="text-xl font-bold text-white truncate">{user.name}</h1>
            <p className="text-xs text-slate-500 mb-4 truncate">{user.email}</p>
            <p className="text-xs text-slate-400 italic mb-6 px-4 line-clamp-2">"{newBio || 'Belum ada bio...'}"</p>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-blue-900/30 pt-4">
              <div className="bg-black/20 p-2 rounded-lg">
                <div className="text-slate-500 mb-1 flex items-center justify-center gap-1"><Calendar size={10}/> Bergabung</div>
                <div className="text-white font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', {month:'short', year:'numeric'})}</div>
              </div>
              <div className="bg-black/20 p-2 rounded-lg">
                <div className="text-slate-500 mb-1 flex items-center justify-center gap-1"><Globe size={10}/> IP Anda</div>
                <div className="text-white font-medium font-mono">{ipAddress}</div>
              </div>
            </div>
          </div>

          {/* Device Info Mini */}
          <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400"><Monitor size={18}/></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500">Device Terdeteksi</div>
              <div className="text-sm font-medium text-white truncate">{deviceInfo}</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SETTINGS FORM */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. GENERAL INFO */}
          <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-5">
            <SectionTitle icon={User} title="Informasi Dasar" />
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nama Lengkap" value={newName} onChange={e => setNewName(e.target.value)} />
                <InputField label="Nomor Telepon" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+62..." type="tel" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Bio Singkat</label>
                <textarea 
                  value={newBio} 
                  onChange={e => setNewBio(e.target.value)} 
                  className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Ceritakan sedikit tentang Anda..."
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                  <Save size={14} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* 2. API KEY & SECURITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* API KEY */}
            <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-5 flex flex-col">
              <SectionTitle icon={Key} title="API Access" />
              <div className="flex-1 flex flex-col justify-center">
                <div className="relative group">
                  <input readOnly value={user.api_key} className="w-full bg-black/40 border border-blue-900/30 rounded-lg py-3 px-3 text-xs text-blue-300 font-mono text-center tracking-wider focus:outline-none cursor-text" />
                  <button 
                    onClick={() => { navigator.clipboard.writeText(user.api_key); showMsg('success', 'API Key Disalin') }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy size={14}/>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2">Rahasiakan key ini. Digunakan untuk akses API.</p>
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-5">
              <SectionTitle icon={Lock} title="Ganti Password" />
              <form onSubmit={changePassword} className="space-y-3">
                <InputField type="password" label="Password Lama" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} />
                <InputField type="password" label="Password Baru" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
                <button type="submit" className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-lg border border-white/10 transition-colors">Update Password</button>
              </form>
            </div>
          </div>

          {/* 3. DANGER ZONE */}
          <div className="border border-red-900/30 rounded-2xl p-5 bg-red-900/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-red-500 font-bold text-sm flex items-center gap-2"><Trash2 size={16}/> Hapus Akun</h4>
              <p className="text-[10px] text-slate-500 mt-1">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
            </div>
            <button className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 text-red-500 text-xs font-bold rounded-lg transition-colors">
              Hapus Permanen
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Settings

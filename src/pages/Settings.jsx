import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 
import { User, Lock, Key, Save, RefreshCw, Shield, AlertTriangle, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const Settings = () => {
  const outletContext = useOutletContext()
  const authContext = useAuth()
  
  const user = outletContext?.user || authContext?.user

  const { addToast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      return addToast('error', 'Konfirmasi password tidak cocok')
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('domku_token')}` 
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password || undefined
        })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      addToast('success', 'Profil berhasil diperbarui')
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      
      if (authContext.refreshSession) {
        authContext.refreshSession()
      }
    } catch (err) {
      addToast('error', err.message || 'Gagal memperbarui profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateKey = async () => {
    if (!confirm('Apakah Anda yakin? API Key lama tidak akan berfungsi lagi.')) return

    setIsRegenerating(true)
    try {
      const res = await fetch('/api/user/apikey', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('domku_token')}`
        }
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      addToast('success', 'API Key berhasil diperbarui')
      if (authContext.refreshSession) {
        authContext.refreshSession()
      }
    } catch (err) {
      addToast('error', err.message || 'Gagal generate API Key')
    } finally {
      setIsRegenerating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    addToast('success', 'Disalin ke clipboard')
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4 py-8 border-b border-white/5 mb-8">
        <div className="p-3 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-2xl border border-white/10 shadow-lg">
          <User size={24} className="text-slate-300"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Pengaturan Akun</h1>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            Kelola profil dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#111318] rounded-2xl border border-white/5 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <User size={14} className="text-blue-500"/> Informasi Profil
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5 opacity-60 pointer-events-none">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email (Permanen)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    readOnly
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Lock size={12} className="text-yellow-500"/> Ganti Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Password Baru</label>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="Kosongkan jika tidak diganti"
                      className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-yellow-500 outline-none transition-colors placeholder:text-slate-700"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-7 text-slate-500 hover:text-white">
                      {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Konfirmasi Password</label>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Ulangi password baru"
                      className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-yellow-500 outline-none transition-colors placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw size={14} className="animate-spin"/> : <Save size={14}/>}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          <div className="bg-[#111318] rounded-2xl border border-red-500/20 p-6 shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <AlertTriangle size={20}/>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Zona Berbahaya</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Menghapus akun akan menghilangkan semua subdomain dan data log secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold transition-all">
                  Hapus Akun Saya
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-[#111318] rounded-2xl border border-white/5 p-6 shadow-lg relative">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Key size={14} className="text-purple-500"/> API Configuration
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#0b0c10] border border-white/10 rounded-xl relative group">
                <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">API Key Anda</label>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-purple-400 truncate">
                    {showKey ? user.api_key : '•'.repeat(24)}
                  </code>
                  <div className="flex gap-1">
                    <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                      {showKey ? <EyeOff size={12}/> : <Eye size={12}/>}
                    </button>
                    <button onClick={() => copyToClipboard(user.api_key)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                      <Copy size={12}/>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                {isRegenerating ? <RefreshCw size={12} className="animate-spin"/> : <RefreshCw size={12}/>}
                Regenerate API Key
              </button>

              <div className="mt-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold text-slate-400 mb-2">Dokumentasi Singkat</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <CheckCircle2 size={10} className="text-green-500"/>
                    <span>Auth Header: <code className="text-slate-300 bg-white/5 px-1 rounded">X-API-Key</code></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <CheckCircle2 size={10} className="text-green-500"/>
                    <span>Rate Limit: 100 req/min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
            <div className="relative z-10 text-center">
              <Shield size={32} className="mx-auto text-blue-400 mb-3 opacity-80"/>
              <h3 className="text-white font-bold text-xs mb-1">Akun Terproteksi</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Akun Anda dilindungi dengan enkripsi end-to-end dan pemantauan aktivitas mencurigakan 24/7.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings
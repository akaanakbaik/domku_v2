import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, ShieldCheck, X, Check, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react'
import Loader from '../components/Loader'
import { useToast } from '../context/ToastContext'

const Auth = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' })
  const [showPass, setShowPass] = useState(false)

  const apiRequest = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, origin: window.location.origin })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      if (mode === 'register') {
        const data = await apiRequest('/api/auth/register', formData)
        addToast('success', data.message)
        setMode('login')
      } 
      else if (mode === 'login') {
        await apiRequest('/api/auth/login-check', { email: formData.email, password: formData.password })
        setMode('otp')
        addToast('success', "Kode OTP terkirim ke email.")
      }
      else if (mode === 'otp') {
        const data = await apiRequest('/api/auth/verify-otp', { email: formData.email, code: formData.otp })
        localStorage.setItem('domku_session', JSON.stringify(data.user))
        window.dispatchEvent(new Event('session-update'))
        addToast('success', `Selamat Datang Kembali, ${data.user.name}!`)
        navigate('/subdomain', { replace: true })
      }
      else if (mode === 'forgot') {
        await apiRequest('/api/auth/forgot-password', { email: formData.email })
        setMode('forgot_sent')
      }
    } catch (err) {
      addToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in duration-500 py-10">
      <div className="w-full max-w-[380px] bg-[#111318] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 mb-4 border border-white/5 shadow-inner">
            {mode === 'register' ? <User size={24} className="text-blue-400"/> : 
             mode === 'otp' ? <ShieldCheck size={24} className="text-green-400"/> :
             mode === 'forgot' ? <KeyRound size={24} className="text-yellow-400"/> :
             <Lock size={24} className="text-blue-400"/>}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">
            {mode === 'login' ? 'Selamat Datang' : mode === 'register' ? 'Buat Akun' : mode === 'otp' ? 'Verifikasi' : mode === 'forgot' ? 'Reset Sandi' : 'Cek Email'}
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            {mode === 'login' ? 'Masuk untuk mengelola DNS' : mode === 'register' ? 'Mulai kelola subdomain gratis' : mode === 'otp' ? 'Masukkan 4 digit kode akses' : mode === 'forgot' ? 'Kami akan mengirim link reset' : 'Link reset telah dikirim'}
          </p>
        </div>

        {mode === 'forgot_sent' ? (
          <div className="text-center space-y-6 relative z-10">
            <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 inline-block animate-bounce"><Check size={32} className="text-green-400"/></div>
            <p className="text-sm text-slate-300 leading-relaxed px-4">Instruksi pemulihan kata sandi telah dikirim ke alamat email Anda.</p>
            <button onClick={() => setMode('login')} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs hover:border-white/20 border border-white/10 transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={14}/> Kembali Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {mode === 'register' && (
              <div className="group/input relative">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600" placeholder="Nama Lengkap" />
              </div>
            )}

            {mode !== 'otp' && (
              <div className="group/input relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600" placeholder="Alamat Email" />
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="group/input relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                <input type={showPass ? "text" : "password"} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600" placeholder="Kata Sandi" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-slate-400 hover:text-white transition-colors font-medium hover:underline decoration-blue-500/50 underline-offset-4">Lupa Password?</button>
              </div>
            )}

            {mode === 'otp' && (
              <div className="space-y-4">
                <div className="relative">
                  <input maxLength={4} required value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0a0b0e] border border-blue-500/50 rounded-xl py-4 text-center text-2xl font-mono font-bold text-white focus:border-blue-400 outline-none tracking-[1em] placeholder:tracking-normal transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]" placeholder="• • • •" autoFocus />
                </div>
                <p className="text-center text-xs text-slate-500">Kode dikirim ke <span className="text-white font-mono">{formData.email}</span></p>
              </div>
            )}

            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] group mt-4">
              {mode === 'register' ? 'Daftar Sekarang' : mode === 'login' ? 'Masuk Akun' : mode === 'forgot' ? 'Kirim Instruksi' : 'Verifikasi Masuk'} 
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        )}

        {mode !== 'forgot_sent' && (
          <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setFormData({ name: '', email: '', password: '', otp: '' })
                }} 
                className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1"
              >
                {mode === 'login' ? 'Daftar Gratis' : 'Login Disini'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth

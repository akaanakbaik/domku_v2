import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, ShieldCheck, X, Check, Eye, EyeOff } from 'lucide-react'
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
    <div className="flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm bg-[#111318]/90 backdrop-blur-md border border-blue-900/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          {mode === 'login' ? 'Masuk' : mode === 'register' ? 'Daftar Baru' : mode === 'otp' ? 'Verifikasi OTP' : mode === 'forgot' ? 'Lupa Sandi' : 'Email Terkirim'}
        </h2>
        <p className="text-slate-500 text-xs text-center mb-8">
          {mode === 'login' ? 'Akses dashboard DNS Anda' : mode === 'register' ? 'Gratis selamanya' : mode === 'otp' ? 'Cek email Anda untuk kode' : mode === 'forgot' ? 'Masukkan email akun' : 'Cek inbox Anda'}
        </p>

        {mode === 'forgot_sent' ? (
          <div className="text-center space-y-6">
            <div className="bg-blue-500/10 p-4 rounded-full inline-block"><Mail size={32} className="text-blue-400"/></div>
            <p className="text-sm text-slate-300">Link reset telah dikirim. Cek email Anda.</p>
            <button onClick={() => setMode('login')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Kembali Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1"><div className="relative"><User className="absolute left-3 top-3 text-slate-500" size={16} /><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none" placeholder="Nama Lengkap" /></div></div>
            )}

            {mode !== 'otp' && (
              <div className="space-y-1"><div className="relative"><Mail className="absolute left-3 top-3 text-slate-500" size={16} /><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none" placeholder="Email" /></div></div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-1">
                <div className="relative"><Lock className="absolute left-3 top-3 text-slate-500" size={16} /><input type={showPass ? "text" : "password"} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="Password" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-500 hover:text-white">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right"><button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Lupa Password?</button></div>
            )}

            {mode === 'otp' && (
              <div className="space-y-1"><div className="relative"><ShieldCheck className="absolute left-3 top-3 text-slate-500" size={16} /><input maxLength={4} required value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 text-center tracking-[8px] font-bold text-lg outline-none" placeholder="0000" /></div></div>
            )}

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-2 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm">
              {mode === 'register' ? 'Daftar' : mode === 'login' ? 'Masuk' : mode === 'forgot' ? 'Kirim Link' : 'Verifikasi'} <ArrowRight size={16} />
            </button>
          </form>
        )}
        
        {mode !== 'forgot_sent' && (
          <div className="mt-6 text-center text-xs text-slate-500">
            {mode === 'login' ? <p>Belum ada akun? <button onClick={() => setMode('register')} className="text-blue-400 font-bold hover:underline">Daftar</button></p> : <p>Sudah punya akun? <button onClick={() => setMode('login')} className="text-blue-400 font-bold hover:underline">Masuk</button></p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth

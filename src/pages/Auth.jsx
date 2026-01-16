import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, ShieldCheck, X, Check } from 'lucide-react'
import Loader from '../components/Loader'

const Auth = () => {
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loginStep, setLoginStep] = useState(1)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' })
  
  const [toast, setToast] = useState({ show: false, type: '', message: '' })

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
    setTimeout(() => setToast({ ...toast, show: false }), 5000)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const safeFetch = async (url, options = {}) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 Detik Timeout

    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await res.json() : null

      if (!res.ok) throw new Error(data?.error || `Server Error: ${res.status}`)
      return data

    } catch (e) {
      clearTimeout(timeoutId)
      throw new Error(e.name === 'AbortError' ? "Koneksi timeout. Server sedang sibuk." : e.message)
    }
  }

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const data = await safeFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, origin: window.location.origin })
      })
      showToast('success', data.message)
      setFormData({ ...formData, name: '', email: '', password: '' })
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // LOGIN STEP 1
  const handleLoginStep1 = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await safeFetch('/api/auth/login-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      setLoginStep(2)
      showToast('success', "Kode OTP telah dikirim.")
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // LOGIN STEP 2 (OTP) - PERBAIKAN UTAMA DISINI
  const handleLoginStep2 = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const data = await safeFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp })
      })
      
      // 1. Simpan Session
      localStorage.setItem('domku_session', JSON.stringify(data.user))
      
      // 2. BERITAHU LAYOUT BAHWA SESSION BERUBAH (PENTING!)
      window.dispatchEvent(new Event('session-update'))
      
      showToast('success', "Login Berhasil! Mengalihkan...")
      
      // 3. Navigate
      setTimeout(() => {
        navigate('/subdomain', { replace: true })
      }, 500)

    } catch (err) {
      showToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${toast.type === 'error' ? 'bg-[#1a1d24] border-red-500 text-red-400' : 'bg-[#1a1d24] border-green-500 text-green-400'}`}>
          {toast.type === 'error' ? <X size={20} /> : <Check size={20} />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{isLoginMode ? (loginStep === 1 ? 'Masuk' : 'Verifikasi OTP') : 'Daftar Baru'}</h2>
        <p className="text-slate-500 text-sm text-center mb-8">{isLoginMode ? (loginStep === 1 ? 'Kelola subdomain Anda' : `Cek email ${formData.email}`) : 'Buat akun gratis'}</p>

        {!isLoginMode && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Nama</label><div className="relative"><User className="absolute left-3 top-3 text-slate-500" size={18} /><input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" placeholder="Nama Anda" /></div></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Email</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-500" size={18} /><input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" placeholder="email@domain.com" /></div></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Password</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-500" size={18} /><input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" /></div></div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-4">Daftar Sekarang <ArrowRight size={18} className="inline ml-1" /></button>
          </form>
        )}

        {isLoginMode && loginStep === 1 && (
          <form onSubmit={handleLoginStep1} className="space-y-4">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Email</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-500" size={18} /><input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" placeholder="email@domain.com" /></div></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Password</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-500" size={18} /><input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" /></div></div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-4">Masuk <ArrowRight size={18} className="inline ml-1" /></button>
          </form>
        )}

        {isLoginMode && loginStep === 2 && (
          <form onSubmit={handleLoginStep2} className="space-y-4">
            <div className="space-y-1"><label className="text-xs font-semibold text-slate-400 ml-1">Kode OTP</label><div className="relative"><ShieldCheck className="absolute left-3 top-3 text-slate-500" size={18} /><input name="otp" type="text" maxLength={4} required value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 text-center tracking-[10px] font-bold text-xl" placeholder="0000" /></div></div>
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold mt-4">Verifikasi</button>
          </form>
        )}
        
        <div className="mt-6 text-center text-sm text-slate-500">
          <button disabled={loading} onClick={() => { setIsLoginMode(!isLoginMode); setLoginStep(1) }} className="text-blue-400 hover:text-blue-300 font-semibold">{isLoginMode ? 'Buat Akun Baru' : 'Sudah Punya Akun'}</button>
        </div>
      </div>
    </div>
  )
}

export default Auth

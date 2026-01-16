import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import Loader from '../components/Loader'

const Auth = () => {
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loginStep, setLoginStep] = useState(1)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  })
  
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const safeFetch = async (url, options) => {
    const res = await fetch(url, options)
    const text = await res.text() 
    try {
      return JSON.parse(text)
    } catch (e) {
      throw new Error(text || `Server Error (${res.status})`)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const nameRegex = /^[a-zA-Z0-9#!_-]+$/
      if (!nameRegex.test(formData.name)) throw new Error("Nama hanya boleh huruf, angka, dan simbol # - ! _")

      const data = await safeFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          origin: window.location.origin
        })
      })
      
      if (!data.success) throw new Error(data.error)
      
      setSuccessMsg("Link konfirmasi telah dikirim ke Email Anda. Silakan cek inbox/spam.")
      setFormData({ ...formData, name: '', email: '', password: '' })
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginStep1 = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw new Error("Email atau Password salah.")

      const otpData = await safeFetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (!otpData.success) throw new Error(otpData.error)

      setLoginStep(2)
      
    } catch (err) {
      setError(err.message)
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const handleLoginStep2 = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await safeFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp })
      })

      if (!data.success) throw new Error(data.error)

      navigate('/subdomain')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {isLoginMode ? (loginStep === 1 ? 'Masuk Akun' : 'Verifikasi Keamanan') : 'Daftar Baru'}
        </h2>
        <p className="text-slate-500 text-sm text-center mb-8">
          {isLoginMode 
            ? (loginStep === 1 ? 'Masuk untuk mengelola subdomain' : `Masukkan OTP yang dikirim ke ${formData.email}`)
            : 'Buat akun dengan email profesional'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-sm text-center">
            {successMsg}
          </div>
        )}

        {!isLoginMode && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Nama Panggilan</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Huruf, angka, #, -, !, _" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="email@anda.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all mt-4">Daftar Sekarang <ArrowRight size={18} className="inline ml-1" /></button>
          </form>
        )}

        {isLoginMode && loginStep === 1 && (
          <form onSubmit={handleLoginStep1} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="email@anda.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all mt-4">Masuk <ArrowRight size={18} className="inline ml-1" /></button>
          </form>
        )}

        {isLoginMode && loginStep === 2 && (
          <form onSubmit={handleLoginStep2} className="space-y-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Kode OTP Login</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 text-slate-500" size={18} />
                <input name="otp" type="text" maxLength={4} required value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-center tracking-[10px] font-bold text-xl" placeholder="0000" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all mt-4">Verifikasi & Masuk</button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button onClick={() => { setIsLoginMode(!isLoginMode); setLoginStep(1); setError(''); setSuccessMsg('') }} className="text-blue-400 hover:text-blue-300 font-semibold">{isLoginMode ? 'Daftar' : 'Login'}</button>
        </div>
      </div>
    </div>
  )
}

export default Auth

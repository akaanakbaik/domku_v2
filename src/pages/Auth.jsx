import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, Key, ArrowRight } from 'lucide-react'
import Loader from '../components/Loader'

const Auth = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)

  const generateRandomApiKey = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'
    
    let result = ''
    for (let i = 0; i < 4; i++) result += letters.charAt(Math.floor(Math.random() * letters.length))
    for (let i = 0; i < 3; i++) result += numbers.charAt(Math.floor(Math.random() * numbers.length))
    for (let i = 0; i < 2; i++) result += symbols.charAt(Math.floor(Math.random() * symbols.length))
    
    return result.split('').sort(() => 0.5 - Math.random()).join('')
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (!data.success) throw new Error(data.error || 'Gagal mengirim kode')
      
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', otp)
        .single()

      if (verifyError || !verifyData) throw new Error('Kode verifikasi salah atau kadaluarsa')

      await supabase.from('verification_codes').delete().eq('email', email)

      if (isLoginMode) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
      } else {
        const apiKey = generateRandomApiKey()
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { api_key: apiKey }
          }
        })
        if (signUpError) throw signUpError

        if (signUpData.user) {
          const { error: dbError } = await supabase.from('users').insert({
            id: signUpData.user.id,
            email: email,
            api_key: apiKey
          })
          if (dbError) console.error('DB Insert Error:', dbError) 
        }
      }

      navigate('/subdomain')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {step === 1 ? (isLoginMode ? 'Masuk Akun' : 'Daftar Baru') : 'Verifikasi OTP'}
        </h2>
        <p className="text-slate-500 text-sm text-center mb-8">
          {step === 1 ? 'Kelola subdomain Anda dengan mudah' : `Kode dikirim ke ${email}`}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="nama@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all mt-4">
              Lanjutkan <ArrowRight size={18} className="inline ml-1" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">Kode OTP (4 Angka)</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors tracking-widest text-lg text-center"
                  placeholder="0000"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all mt-4">
              Verifikasi & Masuk
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full py-2 text-slate-500 hover:text-white text-sm"
            >
              Kembali
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center text-sm text-slate-500">
            {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)} 
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              {isLoginMode ? 'Daftar' : 'Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const token = searchParams.get('token')

  const [pass, setPass] = useState({ new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (!token) {
        setStatus('error')
    } else {
        setStatus('input')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pass.new !== pass.confirm) return addToast('error', "Password tidak sama")
    if (pass.new.length < 6) return addToast('warning', "Minimal 6 karakter")

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ token, newPassword: pass.new })
      })
      const data = await res.json()
      
      if (data.success) {
        setStatus('success')
        setTimeout(() => navigate('/auth'), 3000)
      } else {
        addToast('error', data.error)
      }
    } catch (e) {
      addToast('error', "Koneksi Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm bg-[#111318]/90 backdrop-blur-md border border-blue-900/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

        {status === 'input' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1"><div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="Password Baru"/></div></div>
              <div className="space-y-1"><div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.confirm} onChange={e => setPass({...pass, confirm: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="Konfirmasi Password"/></div></div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm mt-2 transition-all disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Ubah Kata Sandi'}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-6">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-white">Berhasil!</h3>
            <p className="text-slate-400 text-sm mt-2">Password diubah. Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6">
            <XCircle size={56} className="text-red-500 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-white">Link Invalid</h3>
            <button onClick={() => navigate('/auth')} className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700">Login</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

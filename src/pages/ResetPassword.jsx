import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import Loader from '../components/Loader'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [pass, setPass] = useState({ new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('input')

  useEffect(() => {
    if (!token || !email) {
        setStatus('error')
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pass.new !== pass.confirm) return alert("Password tidak sama")
    if (pass.new.length < 6) return alert("Minimal 6 karakter")

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ token, email, newPassword: pass.new })
      })
      const data = await res.json()
      
      if (data.success) {
        setStatus('success')
        setTimeout(() => navigate('/auth'), 3000)
      } else {
        alert(data.error)
      }
    } catch (e) {
      alert("Error koneksi")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl">
        
        {status === 'input' && (
          <>
            <h2 className="text-xl font-bold text-white mb-6 text-center">Reset Kata Sandi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Password Baru</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-lg py-2.5 pl-10 text-sm text-white focus:border-blue-500 outline-none"/></div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Konfirmasi Password</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.confirm} onChange={e => setPass({...pass, confirm: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-lg py-2.5 pl-10 text-sm text-white focus:border-blue-500 outline-none"/></div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm mt-4">Ubah Sandi</button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-6 animate-in zoom-in">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
            <h3 className="text-lg font-bold text-white">Berhasil!</h3>
            <p className="text-slate-400 text-sm mt-2">Kata sandi telah diperbarui.</p>
            <p className="text-slate-500 text-xs mt-4">Mengalihkan ke login dalam 3 detik...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6">
            <XCircle size={48} className="text-red-500 mx-auto mb-4"/>
            <h3 className="text-lg font-bold text-white">Link Tidak Valid</h3>
            <p className="text-slate-400 text-sm mt-2">Link reset ini sudah kadaluarsa atau tidak valid.</p>
            <button onClick={() => navigate('/auth')} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm">Kembali</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ResetPassword

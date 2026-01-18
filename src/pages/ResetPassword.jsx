import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Pastikan ambil params dengan benar
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [pass, setPass] = useState({ new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking') // checking, input, success, error

  useEffect(() => {
    // Validasi awal
    if (!token || !email) {
        setStatus('error')
    } else {
        setStatus('input')
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pass.new !== pass.confirm) return alert("Password konfirmasi tidak cocok.")
    if (pass.new.length < 6) return alert("Password minimal 6 karakter.")

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
      alert("Gagal terhubung ke server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm bg-[#111318]/90 backdrop-blur-md border border-blue-900/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

        {status === 'checking' && (
             <div className="text-center py-10">
                 <Loader2 size={40} className="animate-spin text-blue-500 mx-auto"/>
                 <p className="text-slate-500 text-sm mt-4">Memvalidasi Link...</p>
             </div>
        )}
        
        {status === 'input' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
            <p className="text-slate-500 text-xs text-center mb-8">Buat kata sandi baru untuk {email}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Password Baru</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="••••••••"/></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Konfirmasi</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-3 text-slate-500"/><input type="password" required value={pass.confirm} onChange={e => setPass({...pass, confirm: e.target.value})} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 pl-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="••••••••"/></div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm mt-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Ubah Kata Sandi'}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-6 animate-in zoom-in">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"/>
            <h3 className="text-xl font-bold text-white">Sukses!</h3>
            <p className="text-slate-400 text-sm mt-2">Password berhasil diubah.</p>
            <div className="mt-6 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 text-xs">
                Mengalihkan ke halaman login dalam 3 detik...
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6">
            <XCircle size={56} className="text-red-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"/>
            <h3 className="text-xl font-bold text-white">Link Error</h3>
            <p className="text-slate-400 text-sm mt-2">Link reset tidak valid atau sudah kadaluarsa.</p>
            <button onClick={() => navigate('/auth')} className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">
                Kembali ke Login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ResetPassword

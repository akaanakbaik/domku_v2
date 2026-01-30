import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [status, setStatus] = useState('processing')
  const [msg, setMsg] = useState('')
  
  // REF INI PENTING: Mencegah React menjalankan verifikasi 2 kali
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    const verify = async () => {
      // Jika sudah pernah fetch, stop (Anti Double-Click Logic)
      if (dataFetchedRef.current) return
      dataFetchedRef.current = true

      if (!token || !email) {
        setStatus('error')
        setMsg('Link verifikasi rusak/tidak lengkap.')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Kirim token DAN email agar backend bisa cek status user jika token hilang
          body: JSON.stringify({ token, email })
        })
        const data = await res.json()
        
        if (data.success) {
          setStatus('success')
          addToast('success', data.message || "Selamat Datang! Akun Anda aktif.")
          // Beri waktu user membaca pesan sukses sebelum redirect
          setTimeout(() => navigate('/auth'), 3000)
        } else {
          setStatus('error')
          setMsg(data.error)
          addToast('error', data.error)
        }
      } catch (e) {
        setStatus('error')
        setMsg('Gagal terhubung ke server.')
      }
    }

    verify()
  }, []) // Empty dependency array = run once on mount

  const handleResend = async () => {
    if(!email) return addToast('error', "Email tidak ditemukan.")
    try {
      const res = await fetch('/api/auth/resend-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, origin: window.location.origin })
      })
      const data = await res.json()
      if(data.success) addToast('success', "Link baru telah dikirim ke email.")
      else addToast('error', data.error)
    } catch(e) { addToast('error', "Gagal mengirim ulang.") }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>

        {status === 'processing' && (
          <div className="flex flex-col items-center py-6">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={20} className="text-blue-400 animate-pulse"/>
                </div>
            </div>
            <h2 className="text-lg font-bold text-white mt-6">Memproses Verifikasi...</h2>
            <p className="text-slate-500 text-xs mt-2">Mohon tunggu sebentar</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CheckCircle size={32} className="text-green-500"/>
            </div>
            <h2 className="text-2xl font-bold text-white">Akun Aktif!</h2>
            <p className="text-slate-400 text-sm mt-2">Selamat datang di Domku.</p>
            <div className="mt-6 px-4 py-2 bg-slate-800/50 rounded-lg border border-white/5 text-xs text-slate-500">
                Otomatis beralih ke halaman login...
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <XCircle size={32} className="text-red-500"/>
            </div>
            <h2 className="text-xl font-bold text-white">Verifikasi Gagal</h2>
            <p className="text-red-400 text-sm mt-2 font-medium bg-red-900/10 px-3 py-1 rounded-lg border border-red-500/10">{msg}</p>
            
            <div className="mt-8 w-full space-y-3">
                {email && (
                  <button onClick={handleResend} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                    Kirim Link Baru
                  </button>
                )}
                <button onClick={() => navigate('/auth')} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors border border-white/5">
                    Kembali ke Login
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

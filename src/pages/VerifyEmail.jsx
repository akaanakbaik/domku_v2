import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [status, setStatus] = useState('processing')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setStatus('error')
        setMsg('Link tidak lengkap.')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        })
        const data = await res.json()
        
        if (data.success) {
          setStatus('success')
          setTimeout(() => navigate('/auth'), 3000)
        } else {
          setStatus('error')
          setMsg(data.error)
        }
      } catch (e) {
        setStatus('error')
        setMsg('Gagal terhubung ke server.')
      }
    }
    verify()
  }, [])

  const handleResend = async () => {
    try {
      await fetch('/api/auth/resend-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, origin: window.location.origin })
      })
      alert("Link baru telah dikirim ke email Anda.")
    } catch(e) { alert("Gagal mengirim ulang.") }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      <div className="bg-[#111318] border border-blue-900/30 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
        {status === 'processing' && (
          <div className="flex flex-col items-center">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4"/>
            <h2 className="text-lg font-bold text-white">Memverifikasi...</h2>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in">
            <CheckCircle size={48} className="text-green-500 mb-4"/>
            <h2 className="text-xl font-bold text-white">Email Terverifikasi!</h2>
            <p className="text-slate-400 text-sm mt-2">Akun Anda telah aktif.</p>
            <p className="text-slate-600 text-xs mt-4">Redirecting...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in zoom-in">
            <XCircle size={48} className="text-red-500 mb-4"/>
            <h2 className="text-lg font-bold text-white">Verifikasi Gagal</h2>
            <p className="text-red-400 text-sm mt-2">{msg}</p>
            {email && (
              <button onClick={handleResend} className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all">
                Kirim Ulang Link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

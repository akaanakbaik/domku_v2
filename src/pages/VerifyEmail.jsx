import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const token = searchParams.get('token')
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const verify = async () => {
      if (!token) return setStatus('error')

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await res.json()
        
        if (data.success) {
          setStatus('success')
          addToast('success', "Selamat Datang, Pengguna Baru! Akun Anda aktif.")
          setTimeout(() => navigate('/auth'), 3000)
        } else {
          setStatus('error')
          addToast('error', data.error)
        }
      } catch (e) {
        setStatus('error')
      }
    }
    verify()
  }, [])

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
          <div className="flex flex-col items-center">
            <CheckCircle size={48} className="text-green-500 mb-4"/>
            <h2 className="text-xl font-bold text-white">Email Terverifikasi!</h2>
            <p className="text-slate-400 text-sm mt-2">Selamat Datang!</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle size={48} className="text-red-500 mb-4"/>
            <h2 className="text-lg font-bold text-white">Gagal</h2>
            <p className="text-slate-500 text-sm">Token tidak valid atau expired.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

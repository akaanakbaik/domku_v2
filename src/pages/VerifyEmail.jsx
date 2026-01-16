import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import Loader from '../components/Loader'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [msg, setMsg] = useState('Memverifikasi token...')

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token')
      if (!token) {
        setStatus('error')
        setMsg('Token verifikasi tidak ditemukan dalam URL.')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await res.json()

        if (!data.success) throw new Error(data.error)

        setStatus('success')
        setMsg(data.message)
        
        setTimeout(() => {
          navigate('/auth')
        }, 3000)

      } catch (error) {
        setStatus('error')
        setMsg(error.message)
      }
    }
    
    verify()
  }, [searchParams, navigate])

  if (status === 'loading') return <Loader />

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in duration-300">
      <div className="text-center p-8 bg-[#111318] border border-blue-900/30 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifikasi Berhasil!</h2>
            <p className="text-slate-400 mb-6 text-sm">{msg}</p>
            <p className="text-blue-400 text-xs animate-pulse">Mengalihkan ke halaman login...</p>
            <button 
              onClick={() => navigate('/auth')} 
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
            >
              Login Sekarang
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifikasi Gagal</h2>
            <p className="text-slate-400 mb-6 text-sm">{msg}</p>
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-2 bg-[#1a1d24] hover:bg-[#252932] text-white rounded-xl font-medium transition-all"
            >
              Kembali ke Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

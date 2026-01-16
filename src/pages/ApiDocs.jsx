import React, { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Code, Terminal, Copy, Check, Lock } from 'lucide-react'
import Loader from '../components/Loader'

const ApiDocs = () => {
  const { session } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [host, setHost] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    setHost(window.location.origin)
    setTimeout(() => setLoading(false), 500)
  }, [])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const apiKey = session?.user?.user_metadata?.api_key || 'AbCd123!@'

  const curlExample = `curl -X POST "${host}/api/subdomain" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "subdomain": "contoh",
    "recordType": "A",
    "target": "192.168.1.1"
  }'`

  const responseSuccess = `{
  "author": "Aka",
  "email_author": "akaanakbaik17@proton.me",
  "success": true,
  "data": {
    "id": "dns_record_id",
    "type": "A",
    "name": "contoh.domku.my.id",
    "content": "192.168.1.1",
    "proxiable": true,
    "proxied": true,
    "ttl": 1
  }
}`

  const responseError = `{
  "author": "Aka",
  "email_author": "akaanakbaik17@proton.me",
  "success": false,
  "error": "Limit subdomain tercapai (Max 30)"
}`

  if (loading) return <Loader />

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Terminal className="text-blue-500" size={40} /> Dokumentasi API
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Integrasikan layanan Domku ke dalam aplikasi Anda secara langsung.
          Gunakan API Key Anda untuk autentikasi.
        </p>
      </div>

      {!session && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex items-center gap-3 text-yellow-400 max-w-3xl mx-auto">
          <Lock size={20} />
          <span>Anda harus login untuk melihat API Key asli Anda.</span>
          <Link to="/auth" className="underline hover:text-white ml-auto">Login Sekarang</Link>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#111318] border border-blue-900/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Code size={24} className="text-blue-400" /> Endpoint: Create Subdomain
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg font-bold font-mono text-sm border border-green-500/30">POST</span>
            <code className="text-slate-300 bg-black/30 px-3 py-1 rounded-lg border border-white/10 text-sm w-full font-mono">/api/subdomain</code>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400 font-semibold">Request (cURL)</span>
                <button 
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                  className="text-xs flex items-center gap-1 text-blue-400 hover:text-white transition-colors"
                >
                  {copied === 'curl' ? <Check size={14} /> : <Copy size={14} />} Salin
                </button>
              </div>
              <div className="bg-black border border-white/10 rounded-xl p-4 overflow-x-auto relative group">
                <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">{curlExample}</pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 font-semibold">Response Sukses</span>
                </div>
                <div className="bg-black border border-white/10 rounded-xl p-4 overflow-x-auto h-64 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-black">
                  <pre className="text-blue-300 font-mono text-xs leading-relaxed">{responseSuccess}</pre>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 font-semibold">Response Gagal</span>
                </div>
                <div className="bg-black border border-white/10 rounded-xl p-4 overflow-x-auto h-64 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-black">
                  <pre className="text-red-300 font-mono text-xs leading-relaxed">{responseError}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111318] border border-blue-900/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Batasan & Peraturan</h2>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li className="flex items-start gap-3">
              <span className="bg-blue-900/40 p-1 rounded text-blue-400 mt-0.5">•</span>
              Setiap user dibatasi membuat maksimal <strong>30 subdomain</strong>.
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-900/40 p-1 rounded text-blue-400 mt-0.5">•</span>
              Wajib menyertakan header <code>X-API-Key</code> yang valid.
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-900/40 p-1 rounded text-blue-400 mt-0.5">•</span>
              Dilarang menggunakan subdomain untuk kegiatan ilegal, phishing, atau konten berbahaya.
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-900/40 p-1 rounded text-blue-400 mt-0.5">•</span>
              Tipe record yang didukung: A, CNAME, AAAA, TXT.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ApiDocs

import React, { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Terminal, Copy, Check, Lock, Globe, Server, Shield, Code, LayoutList } from 'lucide-react'
import Loader from '../components/Loader'

const ApiDocs = () => {
  const context = useOutletContext()
  const user = context?.user

  const [loading, setLoading] = useState(true)
  const [host, setHost] = useState('')
  const [copied, setCopied] = useState(null)
  const [activeTab, setActiveTab] = useState('request') // request, success, error

  useEffect(() => {
    setHost(window.location.origin)
    setTimeout(() => setLoading(false), 400)
  }, [])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const apiKey = user?.api_key || 'YOUR_API_KEY'

  const curlExample = `curl -X POST "${host}/api/subdomain" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "subdomain": "project-alpha",
    "recordType": "A",
    "target": "203.0.113.195"
  }'`

  const responseSuccess = `{
  "success": true,
  "data": {
    "id": "a345b075...",
    "type": "A",
    "name": "project-alpha.domku.my.id",
    "content": "203.0.113.195",
    "proxied": false,
    "ttl": 1
  }
}`

  const responseError = `{
  "success": false,
  "error": "Subdomain sudah digunakan"
}`

  const deleteExample = `curl -X DELETE "${host}/api/subdomain/{ID_SUBDOMAIN}" \\
  -H "X-API-Key: ${apiKey}"`

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER COMPACT */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-full mb-2 ring-1 ring-blue-500/30">
            <Terminal className="text-blue-500" size={24} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">API Documentation</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Automate your DNS deployment. Integrate Domku directly into your CI/CD pipeline or application.
        </p>
      </div>

      {/* API KEY WARNING / DISPLAY */}
      {!user ? (
        <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-yellow-500/90 text-xs md:text-sm max-w-2xl mx-auto backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span>Login to view your real <strong>API Key</strong>.</span>
          </div>
          <Link to="/auth" className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-md transition-colors whitespace-nowrap">Login Access</Link>
        </div>
      ) : (
        <div className="glass p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/20 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Shield size={18}/></div>
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Master Key</p>
                    <code className="text-xs sm:text-sm text-white font-mono break-all">{user.api_key}</code>
                </div>
            </div>
            <button onClick={() => copyToClipboard(user.api_key, 'apikey')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                {copied === 'apikey' ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
            </button>
        </div>
      )}

      {/* MAIN ENDPOINT CARD */}
      <div className="bg-[#111318]/80 border border-blue-900/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Endpoint Header */}
        <div className="bg-black/40 border-b border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] font-bold border border-green-500/20">POST</span>
                <span className="text-slate-300 font-mono text-xs sm:text-sm">/api/subdomain</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Create New Record</div>
        </div>

        {/* Interactive Tabs */}
        <div className="flex border-b border-white/5 bg-black/20">
            <button onClick={() => setActiveTab('request')} className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === 'request' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-white'}`}>Request</button>
            <button onClick={() => setActiveTab('success')} className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === 'success' ? 'border-green-500 text-green-400 bg-green-500/5' : 'border-transparent text-slate-500 hover:text-white'}`}>Response 200</button>
            <button onClick={() => setActiveTab('error')} className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === 'error' ? 'border-red-500 text-red-400 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-white'}`}>Response 400</button>
        </div>

        {/* Code Content */}
        <div className="relative group bg-[#0d0e12]">
            <button 
                onClick={() => copyToClipboard(activeTab === 'request' ? curlExample : activeTab === 'success' ? responseSuccess : responseError, 'code')}
                className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all z-10 border border-white/5"
            >
                {copied === 'code' ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
            </button>

            <div className="overflow-x-auto p-4 md:p-6 custom-scrollbar">
                {activeTab === 'request' && (
                    <pre className="text-[10px] sm:text-xs font-mono leading-relaxed text-blue-100 whitespace-pre">{curlExample}</pre>
                )}
                {activeTab === 'success' && (
                    <pre className="text-[10px] sm:text-xs font-mono leading-relaxed text-green-100 whitespace-pre">{responseSuccess}</pre>
                )}
                {activeTab === 'error' && (
                    <pre className="text-[10px] sm:text-xs font-mono leading-relaxed text-red-100 whitespace-pre">{responseError}</pre>
                )}
            </div>
        </div>
        
        {/* Parameters Info */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-[#111318]/50">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2"><LayoutList size={14} className="text-blue-500"/> Body Parameters (JSON)</h3>
            <div className="overflow-hidden rounded-lg border border-white/5">
                <table className="w-full text-left text-[10px] sm:text-xs">
                    <thead className="bg-white/5 text-slate-400">
                        <tr>
                            <th className="p-2 font-medium">Field</th>
                            <th className="p-2 font-medium">Type</th>
                            <th className="p-2 font-medium">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr>
                            <td className="p-2 font-mono text-blue-300">subdomain</td>
                            <td className="p-2 font-mono text-slate-500">string</td>
                            <td className="p-2">Nama subdomain (3-63 chars).</td>
                        </tr>
                        <tr>
                            <td className="p-2 font-mono text-blue-300">recordType</td>
                            <td className="p-2 font-mono text-slate-500">string</td>
                            <td className="p-2">A, CNAME, AAAA, atau TXT.</td>
                        </tr>
                        <tr>
                            <td className="p-2 font-mono text-blue-300">target</td>
                            <td className="p-2 font-mono text-slate-500">string</td>
                            <td className="p-2">IP Address atau Hostname tujuan.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* DELETE ENDPOINT COMPACT */}
      <div className="bg-[#111318]/60 border border-white/5 rounded-xl p-4 md:p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[10px] border border-red-500/20">DELETE</span> 
            Delete Record
        </h3>
        <div className="bg-black/40 rounded-lg p-3 relative group border border-white/5 overflow-x-auto">
            <button onClick={() => copyToClipboard(deleteExample, 'del')} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white transition-colors">{copied === 'del' ? <Check size={12}/> : <Copy size={12}/>}</button>
            <pre className="text-[10px] sm:text-xs font-mono text-slate-300 whitespace-pre">{deleteExample}</pre>
        </div>
      </div>

    </div>
  )
}

export default ApiDocs

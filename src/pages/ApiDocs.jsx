import React, { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Terminal, Copy, Check, Lock, Shield, LayoutList, Server, Box, Zap, AlertTriangle, ChevronRight, Globe, Code, Key } from 'lucide-react'
import Loader from '../components/Loader'

const ApiDocs = () => {
  const context = useOutletContext()
  const user = context?.user

  const [loading, setLoading] = useState(true)
  const [host, setHost] = useState('')
  const [copied, setCopied] = useState(null)
  const [activeTab, setActiveTab] = useState('request')

  useEffect(() => {
    setHost(window.location.origin)
    setTimeout(() => setLoading(false), 400)
  }, [])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const apiKey = user?.api_key || 'YOUR_MASTER_KEY'

  const curlExample = `curl -X POST "${host}/api/subdomain" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "subdomain": "project-one",
    "domain": "domku.xyz", 
    "recordType": "A",
    "target": "203.0.113.195"
  }'`

  const responseSuccess = `{
  "success": true,
  "data": {
    "id": "a345b075...",
    "type": "A",
    "name": "project-one.domku.xyz",
    "content": "203.0.113.195",
    "proxied": false,
    "ttl": 1
  }
}`

  const responseError = `{
  "success": false,
  "error": "Subdomain taken / Domain not supported"
}`

  const deleteExample = `curl -X DELETE "${host}/api/subdomain/{ID}" \\
  -H "X-API-Key: ${apiKey}"`

  if (loading) return <Loader />

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-6">

      <div className="text-center space-y-4 py-8 md:py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>
        
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl mb-2 ring-1 ring-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] animate-pulse-slow">
            <Terminal className="text-blue-400" size={24} />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">API Documentation</h1>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Automate your DNS infrastructure with our robust, high-performance API. Built for developers, optimized for speed.
            </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <Zap size={14} className="text-yellow-400"/> Instant Propagation
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <Shield size={14} className="text-green-400"/> SSL Secured
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <Globe size={14} className="text-blue-400"/> Global CDN
            </div>
        </div>
      </div>

      {!user ? (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-yellow-500/90 text-sm max-w-3xl mx-auto backdrop-blur-md shadow-lg shadow-yellow-900/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl shrink-0"><Lock size={20} /></div>
            <div>
                <h3 className="font-bold text-yellow-100">Authentication Required</h3>
                <p className="text-yellow-500/80 text-xs mt-0.5">Please login to access your production API Key.</p>
            </div>
          </div>
          <Link to="/auth" className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-all shadow-lg shadow-yellow-500/20 font-bold text-xs flex items-center gap-2 whitespace-nowrap group">
            Login Now <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
          </Link>
        </div>
      ) : (
        <div className="glass p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 border border-blue-500/20 max-w-3xl mx-auto shadow-2xl bg-[#111318]/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 w-full overflow-hidden relative z-10">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-xl text-blue-400 border border-blue-500/20 shrink-0"><Key size={20}/></div>
                <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Your Master Key</p>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5 group hover:border-blue-500/30 transition-colors">
                        <code className="text-xs sm:text-sm text-white font-mono truncate select-all">{user.api_key}</code>
                    </div>
                </div>
            </div>
            <button onClick={() => copyToClipboard(user.api_key, 'apikey')} className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl text-slate-400 transition-all border border-white/10 shrink-0 relative z-10 group active:scale-95">
                {copied === 'apikey' ? <Check size={20} className="text-green-400 group-hover:text-white"/> : <Copy size={20}/>}
            </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="bg-[#111318] p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-purple-500/30 transition-all group shadow-lg">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Zap size={20}/></div>
            <div><h3 className="text-white text-sm font-bold">Rate Limit</h3><p className="text-xs text-slate-500 mt-0.5">100 requests / minute per IP.</p></div>
        </div>
        <div className="bg-[#111318] p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-green-500/30 transition-all group shadow-lg">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors"><Server size={20}/></div>
            <div><h3 className="text-white text-sm font-bold">Base URL</h3><p className="text-xs text-slate-500 mt-0.5 font-mono bg-black/30 px-1.5 py-0.5 rounded inline-block">{host}/api</p></div>
        </div>
      </div>

      <div className="bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto ring-1 ring-white/5">
        <div className="bg-black/30 border-b border-white/5 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] tracking-wide">POST</span>
                <span className="text-slate-200 font-mono text-sm font-bold tracking-tight">/api/subdomain</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full"><Box size={12}/> Create Record</div>
        </div>

        <div className="flex border-b border-white/5 bg-black/20">
            {['request', 'success', 'error'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)} 
                    className={`flex-1 py-3 text-[10px] md:text-xs font-bold transition-all uppercase tracking-wider border-b-2 
                    ${activeTab === tab 
                        ? (tab === 'error' ? 'border-red-500 text-red-400 bg-red-500/5' : tab === 'success' ? 'border-green-500 text-green-400 bg-green-500/5' : 'border-blue-500 text-blue-400 bg-blue-500/5') 
                        : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    {tab === 'request' ? 'Example Request' : tab === 'success' ? '200 OK' : '400 Error'}
                </button>
            ))}
        </div>

        <div className="relative group bg-[#090a0c]">
            <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            
            <button 
                onClick={() => copyToClipboard(activeTab === 'request' ? curlExample : activeTab === 'success' ? responseSuccess : responseError, 'code')}
                className="absolute bottom-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all z-10 border border-white/5 hover:border-white/20 active:scale-95"
            >
                {copied === 'code' ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
            </button>

            <div className="overflow-x-auto p-6 md:p-8 custom-scrollbar min-h-[250px]">
                {activeTab === 'request' && <pre className="text-xs font-mono leading-relaxed text-blue-200 whitespace-pre selection:bg-blue-500/30">{curlExample}</pre>}
                {activeTab === 'success' && <pre className="text-xs font-mono leading-relaxed text-green-200 whitespace-pre selection:bg-green-500/30">{responseSuccess}</pre>}
                {activeTab === 'error' && <pre className="text-xs font-mono leading-relaxed text-red-200 whitespace-pre selection:bg-red-500/30">{responseError}</pre>}
            </div>
        </div>

        <div className="bg-[#111318] border-t border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <LayoutList size={16} className="text-blue-500"/>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Request Parameters</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-black/20 text-slate-400 font-bold uppercase tracking-wider border-b border-white/5">
                        <tr>
                            <th className="p-4 w-1/4">Parameter</th>
                            <th className="p-4 w-1/6">Type</th>
                            <th className="p-4">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono text-blue-300 font-bold">subdomain</td>
                            <td className="p-4 font-mono text-purple-400">string</td>
                            <td className="p-4 text-slate-400">The desired subdomain prefix (e.g., <span className="text-white">my-app</span>). Min 3 chars.</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono text-blue-300 font-bold">domain</td>
                            <td className="p-4 font-mono text-purple-400">string</td>
                            <td className="p-4 text-slate-400">Parent domain. Choose: <code className="bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/5">domku.my.id</code> or <code className="bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/5">domku.xyz</code></td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono text-blue-300 font-bold">recordType</td>
                            <td className="p-4 font-mono text-purple-400">string</td>
                            <td className="p-4 text-slate-400">DNS Record type. Supported: <span className="text-yellow-400">A</span>, <span className="text-yellow-400">CNAME</span>, <span className="text-yellow-400">AAAA</span>, <span className="text-yellow-400">TXT</span>.</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono text-blue-300 font-bold">target</td>
                            <td className="p-4 font-mono text-purple-400">string</td>
                            <td className="p-4 text-slate-400">The destination IP address (IPv4/IPv6) or Hostname.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-900/10 to-orange-900/10 border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all group max-w-4xl mx-auto shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] border border-red-500/20 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)] tracking-wide uppercase">DELETE</span> 
            Remove DNS Record
        </h3>
        <div className="bg-black/40 rounded-xl p-4 relative group border border-white/5 overflow-x-auto flex items-center justify-between gap-4">
            <pre className="text-xs font-mono text-red-200/80 whitespace-pre">{deleteExample}</pre>
            <button onClick={() => copyToClipboard(deleteExample, 'del')} className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/10 shrink-0">
                {copied === 'del' ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
            </button>
        </div>
      </div>

    </div>
  )
}

export default ApiDocs

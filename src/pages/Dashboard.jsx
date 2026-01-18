import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check, Plus, Search, Download, QrCode, MapPin, Activity, Clock, RefreshCw, XCircle } from 'lucide-react'
import { DashboardSkeleton } from '../components/Skeleton'

const Dashboard = () => {
  const context = useOutletContext()
  const user = context?.user

  const [loading, setLoading] = useState(true)
  const [subdomains, setSubdomains] = useState([])
  const [activities, setActivities] = useState([])
  const [formData, setFormData] = useState({ name: '', type: 'A', target: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [copyStatus, setCopyStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQr, setShowQr] = useState(null)
  const [activeTab, setActiveTab] = useState('domains')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Ref untuk Scroll otomatis
  const historyRef = useRef(null)

  // 1. FETCH DATA (Subdomains & Logs)
  const fetchData = async () => {
    try {
      if (!user) return
      setIsRefreshing(true)

      const { data: subData } = await supabase
        .from('subdomains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (subData) setSubdomains(subData)

      const { data: logData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logData) setActivities(logData)

    } catch (error) {
      console.error("Fetch Error", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // 2. REALTIME LISTENER
  useEffect(() => {
    fetchData()
    const subscription = supabase
      .channel('public:dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subdomains' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [user])

  if (!user) return null

  // 3. CREATE HANDLER (With Auto Scroll)
  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg({ type: 'loading', text: 'Processing...' })
    try {
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': user.api_key },
        body: JSON.stringify({ subdomain: formData.name, recordType: formData.type, target: formData.target })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      
      setMsg({ type: 'success', text: 'Created!' })
      setFormData({ name: '', type: 'A', target: '' })
      
      // Auto switch to history & scroll
      setActiveTab('history')
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)

    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  // 4. DELETE HANDLER (Sync Cloudflare)
  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus ${name}?`)) return
    setDeletingId(id)
    try {
        const res = await fetch(`/api/subdomain/${id}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': user.api_key }
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        
        // Optimistic UI Update
        setSubdomains(prev => prev.filter(item => item.id !== id))
        
    } catch (err) {
        alert("Gagal: " + err.message)
    } finally {
        setDeletingId(null)
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 1500)
  }

  const filteredSubdomains = subdomains.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6 pb-24 relative animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* QR MODAL */}
      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setShowQr(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-center animate-in zoom-in duration-300 w-full max-w-[280px]" onClick={e => e.stopPropagation()}>
                <h3 className="text-black font-bold mb-4 text-sm truncate">{showQr}</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://${showQr}`} alt="QR" className="mx-auto rounded-xl border-2 border-black w-full" />
                <button onClick={() => setShowQr(null)} className="mt-5 w-full py-2.5 bg-black text-white rounded-lg font-bold text-xs hover:bg-gray-900 transition-colors">Close</button>
            </div>
        </div>
      )}

      {/* CREATE CARD */}
      <div className="glass rounded-xl p-5 relative overflow-hidden shadow-lg border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500"><Globe size={18} /></div>
            <div><h2 className="text-lg font-bold text-white leading-tight">Deploy</h2><p className="text-[10px] text-slate-500">Cloudflare DNS</p></div>
          </div>
          <button onClick={fetchData} className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={14}/></button>
        </div>
        
        {msg.text && (
          <div className={`mb-4 p-2.5 rounded-lg border flex items-center gap-2 relative z-10 text-[11px] ${msg.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : (msg.type === 'loading' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : 'bg-green-900/20 border-green-500/30 text-green-400')}`}>
            {msg.type === 'loading' ? <RefreshCw size={12} className="animate-spin"/> : msg.type === 'error' ? <XCircle size={12}/> : <Check size={12}/>}
            <span className="font-medium">{msg.text}</span>
          </div>
        )}
        
        <form onSubmit={handleCreate} className="space-y-3 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-5 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Subdomain</label>
                <div className="relative group">
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })} className="w-full bg-[#0b0c10]/60 border border-blue-900/20 rounded-lg py-2 px-3 text-xs text-white focus:border-blue-500 placeholder-slate-700 transition-all outline-none" placeholder="name" />
                    <div className="absolute right-3 top-2 text-[10px] text-slate-600 font-mono pointer-events-none">.domku.my.id</div>
                </div>
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0b0c10]/60 border border-blue-900/20 rounded-lg py-2 px-2 text-xs text-white cursor-pointer outline-none focus:border-blue-500 appearance-none">
                    <option value="A">A</option><option value="CNAME">CNAME</option><option value="AAAA">AAAA</option><option value="TXT">TXT</option>
                </select>
            </div>
            <div className="md:col-span-5 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Target</label>
                <input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10]/60 border border-blue-900/20 rounded-lg py-2 px-3 text-xs text-white focus:border-blue-500 font-mono placeholder-slate-700 outline-none" placeholder="1.1.1.1" />
            </div>
          </div>
          <button type="submit" disabled={msg.type === 'loading'} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">{msg.type === 'loading' ? 'Processing...' : <><Plus size={14} /> Create Record</>}</button>
        </form>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-blue-900/20 pb-1 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('domains')} className={`flex items-center gap-1.5 pb-2 px-3 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'domains' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}><Globe size={12}/> Domains ({subdomains.length})</button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 pb-2 px-3 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}><Activity size={12}/> Log</button>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {/* DOMAINS LIST */}
        {activeTab === 'domains' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3">
              <div className="relative w-full sm:w-48"><Search className="absolute left-2.5 top-2 text-slate-600" size={12} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111318] border border-blue-900/20 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-white focus:border-blue-500 focus:outline-none transition-colors placeholder-slate-700" /></div>
              <button onClick={exportData} className="w-full sm:w-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition-colors text-slate-400 hover:text-white"><Download size={12}/> Export</button>
            </div>

            {loading ? <DashboardSkeleton /> : filteredSubdomains.length === 0 ? (
                <div className="text-center py-12 bg-[#111318]/50 rounded-xl border border-blue-900/10 border-dashed"><Globe size={24} className="mx-auto mb-2 text-blue-900/50"/><p className="text-slate-600 text-xs">No active subdomains.</p></div>
            ) : (
              <div className="grid gap-2">
                {filteredSubdomains.map((item) => (
                  <div key={item.id} className="group glass bg-[#111318]/40 hover:bg-[#161920]/80 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-3 transition-all border border-white/5 hover:border-blue-500/20">
                    <div className="flex-1 text-center sm:text-left w-full min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1"><h4 className="font-bold text-white text-xs truncate max-w-[150px] sm:max-w-none">{item.name}</h4><span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'A' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>{item.type}</span></div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-slate-500 font-mono"><span className="flex items-center gap-1 truncate max-w-[200px]"><MapPin size={10} className="text-slate-700"/> {item.target}</span></div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-center">
                      <button onClick={() => setShowQr(item.name)} className="p-1.5 bg-white/5 text-slate-500 hover:text-white rounded border border-white/5 transition-colors hover:bg-blue-600 hover:border-blue-600"><QrCode size={12} /></button>
                      <button onClick={() => copyToClipboard(item.name, item.id)} className="p-1.5 bg-white/5 text-slate-500 hover:text-white rounded border border-white/5 hover:bg-green-600 hover:border-green-600 transition-colors">{copyStatus === item.id ? <Check size={12} /> : <Copy size={12} />}</button>
                      <button onClick={() => handleDelete(item.id, item.name)} disabled={deletingId === item.id} className="p-1.5 bg-white/5 text-slate-500 hover:text-white rounded border border-white/5 hover:bg-red-600 hover:border-red-600 transition-colors disabled:opacity-50">{deletingId === item.id ? <RefreshCw size={12} className="animate-spin"/> : <Trash2 size={12} />}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* LOGS LIST */}
        {activeTab === 'history' && (
          <div ref={historyRef} className="bg-[#111318]/50 border border-blue-900/10 rounded-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] sm:text-xs">
                  <thead className="bg-black/20 text-slate-500 uppercase font-bold"><tr><th className="p-3">Action</th><th className="p-3">Detail</th><th className="p-3 hidden sm:table-cell">IP</th><th className="p-3 text-right">Time</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {activities.length === 0 ? (
                      <tr><td colSpan="4" className="p-6 text-center text-slate-600">No recent activity.</td></tr>
                    ) : (
                      activities.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                            {log.action.includes('CREATE') ? <Globe size={10} className="text-green-500"/> : log.action.includes('DELETE') ? <Trash2 size={10} className="text-red-500"/> : <Activity size={10} className="text-slate-500"/>}
                            {log.action.replace('_SUBDOMAIN','')}
                          </td>
                          <td className="p-3 text-slate-400 max-w-[120px] sm:max-w-[200px] truncate">{log.details}</td>
                          <td className="p-3 font-mono text-slate-600 hidden sm:table-cell">{log.ip_address}</td>
                          <td className="p-3 text-right text-slate-600 whitespace-nowrap"><div className="flex items-center justify-end gap-1"><Clock size={10}/>{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</div></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

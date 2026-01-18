import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check, Plus, Search, Download, QrCode, MapPin, Activity, Clock, RefreshCw } from 'lucide-react'
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

  // Ref untuk Auto Scroll
  const historySectionRef = useRef(null)

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
      console.error(error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const subscription = supabase
      .channel('public:dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subdomains' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [user])

  if (!user) return null

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
      
      setMsg({ type: 'success', text: 'Success!' })
      setFormData({ name: '', type: 'A', target: '' })
      
      // AUTO SCROLL KE HISTORY
      setActiveTab('history')
      setTimeout(() => {
        historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)

    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus ${name} permanen?`)) return
    setDeletingId(id)
    try {
        // PANGGIL API DELETE AGAR CLOUDFLARE JUGA KEHAPUS
        const res = await fetch(`/api/subdomain/${id}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': user.api_key }
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        
        // Refresh manual jika realtime telat
        setSubdomains(prev => prev.filter(item => item.id !== id))
        setActiveTab('history') // Pindah ke log untuk lihat bukti hapus
    } catch (err) {
        alert("Gagal hapus: " + err.message)
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
    <div className="space-y-6 pb-20 relative animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQr(null)}>
            <div className="bg-white p-5 rounded-2xl shadow-2xl text-center animate-in zoom-in duration-300 max-w-xs w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-black font-bold mb-3 truncate text-sm">{showQr}</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://${showQr}`} alt="QR" className="mx-auto rounded-lg border-2 border-black w-full" />
                <button onClick={() => setShowQr(null)} className="mt-4 w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Close</button>
            </div>
        </div>
      )}

      {/* CREATE FORM (Compact) */}
      <div className="glass rounded-xl p-5 relative overflow-hidden shadow-xl transition-all">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500"><Globe size={20} /></div>
            <div><h2 className="text-lg font-bold text-white">Deploy</h2><p className="text-slate-500 text-xs">DNS Manager</p></div>
          </div>
          <button onClick={fetchData} className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={16}/></button>
        </div>
        
        {msg.text && (
          <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 relative z-10 text-xs ${msg.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : (msg.type === 'loading' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : 'bg-green-900/20 border-green-500/30 text-green-400')}`}>
            <AlertCircle size={14} className={msg.type === 'loading' ? 'animate-spin' : ''} />
            <span className="font-medium">{msg.text}</span>
          </div>
        )}
        
        <form onSubmit={handleCreate} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Subdomain</label>
                <div className="relative group">
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })} className="w-full bg-[#0b0c10]/80 border border-blue-900/30 rounded-lg py-2.5 px-3 text-sm text-white focus:border-blue-500 placeholder-slate-700 transition-all outline-none" placeholder="name" />
                    <div className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono pointer-events-none">.domku.my.id</div>
                </div>
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0b0c10]/80 border border-blue-900/30 rounded-lg py-2.5 px-3 text-sm text-white cursor-pointer outline-none focus:border-blue-500">
                    <option value="A">A</option><option value="CNAME">CNAME</option><option value="AAAA">AAAA</option><option value="TXT">TXT</option>
                </select>
            </div>
            <div className="md:col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Target</label>
                <input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10]/80 border border-blue-900/30 rounded-lg py-2.5 px-3 text-sm text-white focus:border-blue-500 font-mono placeholder-slate-700 outline-none" placeholder="1.1.1.1" />
            </div>
          </div>
          <button type="submit" disabled={msg.type === 'loading'} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">{msg.type === 'loading' ? 'Processing...' : <><Plus size={16} /> Deploy</>}</button>
        </form>
      </div>

      {/* TABS COMPACT */}
      <div className="flex gap-4 border-b border-blue-900/30 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('domains')} className={`flex items-center gap-2 pb-2 px-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'domains' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}><Globe size={14}/> Domains ({subdomains.length})</button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 pb-2 px-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}><Activity size={14}/> Activity Log</button>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {activeTab === 'domains' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-3">
              <div className="relative w-full md:w-56"><Search className="absolute left-3 top-2.5 text-slate-500" size={14} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111318] border border-blue-900/20 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-blue-500 focus:outline-none transition-colors" /></div>
            </div>

            {loading ? <DashboardSkeleton /> : filteredSubdomains.length === 0 ? (
                <div className="text-center py-16 bg-[#111318]/50 rounded-xl border border-blue-900/20 border-dashed"><Globe size={32} className="mx-auto mb-3 text-blue-900/50"/><p className="text-slate-500 text-sm">No subdomains found.</p></div>
            ) : (
              <div className="grid gap-2">
                {filteredSubdomains.map((item) => (
                  <div key={item.id} className="group glass bg-[#111318]/40 hover:bg-[#161920]/80 rounded-lg p-3 flex flex-col md:flex-row justify-between items-center gap-3 transition-all border border-white/5 hover:border-blue-500/30">
                    <div className="flex-1 text-center md:text-left w-full min-w-0">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1"><h4 className="font-bold text-white text-sm truncate">{item.name}</h4><span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${item.type === 'A' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-purple-500/30 text-purple-400 bg-purple-500/10'}`}>{item.type}</span></div>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-slate-500 font-mono"><span className="flex items-center gap-1 truncate"><MapPin size={10} className="text-slate-600"/> {item.target}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowQr(item.name)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-colors hover:bg-blue-600 hover:border-blue-600"><QrCode size={14} /></button>
                      <button onClick={() => copyToClipboard(item.name, item.id)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 hover:bg-green-600 hover:border-green-600 transition-colors">{copyStatus === item.id ? <Check size={14} /> : <Copy size={14} />}</button>
                      <button onClick={() => handleDelete(item.id, item.name)} disabled={deletingId === item.id} className="p-2 bg-red-900/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg border border-red-900/20 hover:border-red-600 transition-colors disabled:opacity-50">{deletingId === item.id ? <RefreshCw size={14} className="animate-spin"/> : <Trash2 size={14} />}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div ref={historySectionRef} className="bg-[#111318]/50 border border-blue-900/20 rounded-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/20 text-slate-400 uppercase font-bold"><tr><th className="p-3">Action</th><th className="p-3">Detail</th><th className="p-3 hidden sm:table-cell">IP</th><th className="p-3 text-right">Time</th></tr></thead>
                  <tbody className="divide-y divide-blue-900/10">
                    {activities.length === 0 ? (
                      <tr><td colSpan="4" className="p-6 text-center text-slate-500">No recent activity.</td></tr>
                    ) : (
                      activities.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            {log.action === 'CREATE_SUBDOMAIN' ? <Globe size={12} className="text-green-500"/> : log.action === 'DELETE_SUBDOMAIN' ? <Trash2 size={12} className="text-red-500"/> : <Activity size={12} className="text-slate-500"/>}
                            {log.action.replace('_SUBDOMAIN','')}
                          </td>
                          <td className="p-3 text-slate-300 max-w-[150px] truncate">{log.details}</td>
                          <td className="p-3 font-mono text-slate-500 hidden sm:table-cell">{log.ip_address}</td>
                          <td className="p-3 text-right text-slate-500"><div className="flex items-center justify-end gap-1"><Clock size={10}/>{new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', day:'numeric', month:'short' })}</div></td>
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

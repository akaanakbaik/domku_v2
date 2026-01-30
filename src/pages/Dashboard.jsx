import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, Plus, Search, Download, QrCode, MapPin, Activity, Clock, RefreshCw, Check, Server, Info, AlertCircle, BarChart3, ChevronDown, ChevronUp, Router, Database, Link, ArrowRight, X } from 'lucide-react'
import { DashboardSkeleton } from '../components/Skeleton'
import Loader from '../components/Loader'
import { useToast } from '../context/ToastContext'

const Dashboard = () => {
  const { user } = useOutletContext()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [subdomains, setSubdomains] = useState([])
  const [domains, setDomains] = useState([]) 
  const [activities, setActivities] = useState([])

  const [formData, setFormData] = useState({ name: '', type: 'A', target: '', domain: 'domku.my.id' })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQr, setShowQr] = useState(null)
  const [activeTab, setActiveTab] = useState('domains')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [showDomainSelector, setShowDomainSelector] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  
  const domainRef = useRef(null)
  const typeRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domainRef.current && !domainRef.current.contains(event.target)) setShowDomainSelector(false)
      if (typeRef.current && !typeRef.current.contains(event.target)) setShowTypeSelector(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchData = async () => {
    try {
      if (!user) return
      setIsRefreshing(true)

      const { data: domData } = await supabase.from('domains').select('domain').eq('is_active', true)
      if (domData) {
          setDomains(domData)
          if(domData.length > 0 && !formData.domain) setFormData(prev => ({...prev, domain: domData[0].domain}))
      }

      const { data: subData } = await supabase.from('subdomains').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (subData) setSubdomains(subData)

      const { data: logData } = await supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      if (logData) setActivities(logData)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
        fetchData()
        const sub = supabase.channel('dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subdomains' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchData)
            .subscribe()
        return () => { supabase.removeChannel(sub) }
    }
  }, [user])

  if (!user) return <div className="flex justify-center py-20"><Loader/></div>

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': user.api_key },
        body: JSON.stringify({ subdomain: formData.name, recordType: formData.type, target: formData.target, domain: formData.domain })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      addToast('success', `Subdomain ${formData.name}.${formData.domain} successfully created!`)
      setFormData(prev => ({ ...prev, name: '', target: '' }))
      setActiveTab('history')
      setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500)

    } catch (err) {
      addToast('error', err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
        const res = await fetch(`/api/subdomain/${confirmDelete.id}`, {
            method: 'DELETE',
            headers: { 'X-API-Key': user.api_key }
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        addToast('success', "DNS Record deleted successfully")
        setConfirmDelete(null)
    } catch (err) {
        addToast('error', err.message)
    } finally {
        setDeletingId(null)
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 1500)
    addToast('info', "Copied to clipboard")
  }

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subdomains, null, 2))
    const link = document.createElement('a')
    link.href = dataStr
    link.download = `domku_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const filteredSubdomains = subdomains.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4 pb-24 relative animate-in fade-in duration-500 max-w-4xl mx-auto px-2 md:px-4">

      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowQr(null)}>
            <div className="bg-[#111318] border border-white/10 p-5 rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-200 w-full max-w-xs relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowQr(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"><X size={18}/></button>
                <div className="mb-3">
                    <h3 className="text-white font-bold text-sm mb-0.5">Quick Access</h3>
                    <p className="text-slate-500 text-[10px] truncate px-2">{showQr}</p>
                </div>
                <div className="p-2 bg-white rounded-xl mx-auto w-fit shadow-inner">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://${showQr}`} alt="QR" className="w-40 h-40" />
                </div>
                <div className="mt-4 flex justify-center">
                    <a href={`http://${showQr}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[10px] font-bold transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        Visit Site <ArrowRight size={12}/>
                    </a>
                </div>
            </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111318] border border-red-500/20 p-5 rounded-2xl shadow-2xl w-full max-w-xs relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500 animate-pulse"><AlertCircle size={24}/></div>
                </div>
                <h3 className="text-white font-bold text-center text-sm mb-1">Delete Record?</h3>
                <p className="text-slate-400 text-center text-[10px] mb-5 px-2">Are you sure you want to delete <span className="text-white font-mono">{confirmDelete.name}</span>? This action is irreversible.</p>
                <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-[10px] transition-all border border-white/5">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] transition-all shadow-lg shadow-red-900/20">Delete</button>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#111318] p-3 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center group hover:border-blue-500/20 transition-all">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Records</span>
            <div className="text-lg font-black text-white mt-0.5 group-hover:text-blue-400 transition-colors">{subdomains.length}</div>
        </div>
        <div className="bg-[#111318] p-3 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center group hover:border-purple-500/20 transition-all">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Account Limit</span>
            <div className="text-lg font-black text-white mt-0.5 group-hover:text-purple-400 transition-colors">30</div>
        </div>
      </div>

      <div className="bg-[#111318] rounded-2xl p-1 relative overflow-hidden border border-white/10 shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="bg-[#0b0c10]/80 backdrop-blur-xl rounded-[14px] p-4 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white tracking-tight uppercase pl-1">New Record</h2>
                <button onClick={fetchData} className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={12}/></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4 space-y-1 group">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1 group-focus-within:text-blue-400 transition-colors">Subdomain <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-2 pl-3 pr-3 text-[11px] text-white focus:border-blue-500 placeholder-slate-700 transition-all outline-none font-medium shadow-inner h-9" placeholder="my-project" />
                        </div>
                    </div>

                    <div className="md:col-span-3 space-y-1 relative group" ref={domainRef}>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-400 transition-colors">Domain</label>
                        <button type="button" onClick={() => setShowDomainSelector(!showDomainSelector)} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-2 px-3 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all text-left h-9">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="text-[11px] text-white font-bold truncate">{formData.domain}</span>
                            </div>
                            <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${showDomainSelector ? 'rotate-180' : ''}`}/>
                        </button>
                        {showDomainSelector && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b20] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                                {domains.map((d) => (
                                    <button type="button" key={d.domain} onClick={() => { setFormData({...formData, domain: d.domain}); setShowDomainSelector(false) }} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-colors text-left ${formData.domain === d.domain ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                                        <span className="text-[10px] font-bold">{d.domain}</span>
                                        {formData.domain === d.domain && <Check size={12}/>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-1 relative group" ref={typeRef}>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-400 transition-colors">Type</label>
                        <button type="button" onClick={() => setShowTypeSelector(!showTypeSelector)} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-2 px-3 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all text-left h-9">
                            <span className="text-[11px] text-white font-bold">{formData.type}</span>
                            <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${showTypeSelector ? 'rotate-180' : ''}`}/>
                        </button>
                        {showTypeSelector && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b20] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                                {['A', 'CNAME', 'AAAA', 'TXT'].map((t) => (
                                    <button type="button" key={t} onClick={() => { setFormData({...formData, type: t}); setShowTypeSelector(false) }} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-colors text-left ${formData.type === t ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                                        <span className="text-[10px] font-bold">{t}</span>
                                        {formData.type === t && <Check size={12}/>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-1 group">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1 group-focus-within:text-blue-400 transition-colors">Target <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-2 pl-3 pr-3 text-[11px] text-white focus:border-blue-500 font-mono placeholder-slate-700 outline-none transition-all shadow-inner h-9" placeholder={formData.type === 'CNAME' ? 'target.host.com' : '192.168.1.1'} />
                        </div>
                    </div>
                </div>

                <div className="pt-1">
                    <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold text-[10px] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-[0.99] group h-9">
                        {isSubmitting ? <Loader size={14} className="animate-spin text-white"/> : <><Plus size={14} className="group-hover:rotate-90 transition-transform"/> Create</>}
                    </button>
                </div>
            </form>
        </div>
      </div>

      <div className="flex gap-3 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar mask-gradient">
        {['domains', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-1.5 pb-2 px-2 text-[10px] font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-blue-400 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}>
                {tab === 'domains' ? <Globe size={12}/> : <Activity size={12}/>} 
                {tab === 'domains' ? 'Records' : 'Logs'}
            </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'domains' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-[#111318] p-2 rounded-xl border border-white/5">
              <div className="relative w-full sm:w-56 group">
                <Search className="absolute left-2.5 top-2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={12} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0b0c10] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:border-blue-500 focus:outline-none transition-colors placeholder-slate-700" />
              </div>
              <button onClick={exportData} className="w-full sm:w-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-bold rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition-colors text-slate-300 hover:text-white"><Download size={12}/> JSON</button>
            </div>

            {loading ? <DashboardSkeleton /> : filteredSubdomains.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#111318]/50 rounded-2xl border border-white/5 border-dashed">
                    <div className="p-3 bg-white/5 rounded-full mb-2"><Globe size={24} className="text-slate-600"/></div>
                    <h3 className="text-white font-bold text-xs">No Records</h3>
                    <p className="text-slate-500 text-[10px] mt-0.5">Create your first subdomain.</p>
                </div>
            ) : (
              <div className="grid gap-2">
                {filteredSubdomains.map((item) => (
                  <div key={item.id} className="group bg-[#111318] hover:bg-[#16181d] rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border border-white/5 hover:border-blue-500/20 shadow-sm hover:shadow-md">
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase min-w-[40px] text-center border ${item.type === 'A' ? 'bg-green-500/10 text-green-400 border-green-500/20' : item.type === 'CNAME' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-700/20 text-slate-400 border-slate-700/30'}`}>{item.type}</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="font-bold text-white text-[11px] truncate">{item.name}</h4>
                            <a href={`http://${item.name}`} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors"><Link size={10}/></a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono pl-0.5">
                        <MapPin size={10} className="text-slate-600"/> 
                        <span className="truncate">{item.target}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end border-t border-white/5 sm:border-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                      <button onClick={() => setShowQr(item.name)} className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-600 transition-colors border border-transparent hover:border-blue-500" title="QR Code"><QrCode size={12} /></button>
                      <button onClick={() => copyToClipboard(item.name, item.id)} className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-green-600 transition-colors border border-transparent hover:border-green-500" title="Copy">{copyStatus === item.id ? <Check size={12} /> : <Copy size={12} />}</button>
                      <button onClick={() => setConfirmDelete(item)} className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-red-600 transition-colors border border-transparent hover:border-red-500" title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div ref={historyRef} className="bg-[#111318] border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 shadow-lg">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                        <th className="p-3 pl-4">Type</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Detail</th>
                        <th className="p-3 hidden sm:table-cell">IP</th>
                        <th className="p-3 text-right pr-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {activities.length === 0 ? (
                      <tr><td colSpan="5" className="p-6 text-center text-slate-600 italic">No logs yet.</td></tr>
                    ) : (
                      activities.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-3 pl-4">
                            <div className={`p-1 rounded-md w-fit ${log.action.includes('CREATE') ? 'bg-green-500/10 text-green-400' : log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {log.action.includes('CREATE') ? <Plus size={10}/> : log.action.includes('DELETE') ? <Trash2 size={10}/> : <Activity size={10}/>}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-white">{log.action.replace('_SUBDOMAIN','').replace('_',' ')}</td>
                          <td className="p-3 text-slate-400 max-w-[100px] sm:max-w-[150px] truncate font-mono">{log.details}</td>
                          <td className="p-3 text-slate-500 font-mono hidden sm:table-cell">{log.ip_address}</td>
                          <td className="p-3 pr-4 text-right text-slate-500 font-mono text-[8px]">{new Date(log.created_at).toLocaleString('id-ID')}</td>
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

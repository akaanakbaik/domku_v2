import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check, Plus, Search, Download, QrCode, MapPin } from 'lucide-react'
import Loader from '../components/Loader'

const Dashboard = () => {
  const context = useOutletContext()
  const user = context?.user

  const [loading, setLoading] = useState(true)
  const [subdomains, setSubdomains] = useState([])
  const [formData, setFormData] = useState({ name: '', type: 'A', target: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [copyStatus, setCopyStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQr, setShowQr] = useState(null)

  useEffect(() => {
    if (!user) return 
    const fetchData = async () => {
      try {
        const { data } = await supabase.from('subdomains').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (data) setSubdomains(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (!user) return <Loader />

  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg({ type: 'loading', text: 'Memverifikasi & Membuat...' })
    try {
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': user.api_key },
        body: JSON.stringify({ subdomain: formData.name, recordType: formData.type, target: formData.target })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setMsg({ type: 'success', text: 'Subdomain berhasil diamankan & aktif!' })
      setFormData({ name: '', type: 'A', target: '' })
      
      const { data: updated } = await supabase.from('subdomains').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (updated) setSubdomains(updated)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus permanen?')) return
    await supabase.from('subdomains').delete().eq('id', id)
    setSubdomains(prev => prev.filter(item => item.id !== id))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 1500)
  }

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subdomains, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "domku_backup.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const filteredSubdomains = subdomains.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) return <Loader />

  return (
    <div className="space-y-8 pb-20 relative">
      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQr(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-center animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <h3 className="text-black font-bold mb-4">{showQr}</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://${showQr}`} alt="QR" className="mx-auto rounded-lg border-2 border-black" />
                <button onClick={() => setShowQr(null)} className="mt-6 px-6 py-2 bg-black text-white rounded-lg font-bold">Tutup</button>
            </div>
        </div>
      )}

      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all hover:border-blue-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10"><Globe className="text-blue-500" /> Secure DNS Manager</h2>
        
        {msg.text && <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 relative z-10 animate-in slide-in-from-top-2 ${msg.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}><AlertCircle size={20} /><span>{msg.text}</span></div>}
        
        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Subdomain</label><div className="relative group"><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:border-blue-500 placeholder-slate-700 transition-all" placeholder="project" /><div className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono pointer-events-none group-focus-within:text-blue-400">.domku.my.id</div></div></div>
            <div className="md:col-span-2 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white cursor-pointer"><option value="A">A</option><option value="CNAME">CNAME</option><option value="AAAA">AAAA</option><option value="TXT">TXT</option></select></div>
            <div className="md:col-span-5 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Target</label><input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:border-blue-500 font-mono placeholder-slate-700" placeholder="1.1.1.1" /></div>
          </div>
          <button type="submit" disabled={msg.type === 'loading'} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">{msg.type === 'loading' ? <Loader /> : <><Plus size={20} /> Deploy Securely</>}</button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div className="flex gap-4 items-center">
             <h3 className="text-xl font-bold text-white">Domains ({subdomains.length})</h3>
             <button onClick={exportData} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs rounded-full border border-white/10 flex items-center gap-1 transition-colors"><Download size={12}/> Backup JSON</button>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input type="text" placeholder="Filter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111318] border border-blue-900/20 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500" />
          </div>
        </div>

        {filteredSubdomains.length === 0 ? <div className="text-center py-16 bg-[#111318] rounded-2xl border border-blue-900/20 border-dashed"><Globe size={32} className="mx-auto mb-4 text-blue-900"/><p className="text-slate-500">Aman & Kosong.</p></div> : 
          <div className="grid gap-3">
            {filteredSubdomains.map((item) => (
              <div key={item.id} className="group bg-[#111318] border border-blue-900/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/40 transition-all hover:bg-[#161920]">
                <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h4 className="font-bold text-white text-lg">{item.name}</h4>
                    <span className={`text-[10px] px-1.5 rounded border ${item.type === 'A' ? 'border-green-500/30 text-green-400' : 'border-purple-500/30 text-purple-400'}`}>{item.type}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><MapPin size={10}/> Target: {item.target}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowQr(item.name)} className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-colors" title="QR Code"><QrCode size={18} /></button>
                  <button onClick={() => copyToClipboard(item.name, item.id)} className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5">{copyStatus === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}</button>
                  <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-900/10 text-red-400 hover:bg-red-900/30 rounded-lg border border-red-900/20"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )
}

export default Dashboard

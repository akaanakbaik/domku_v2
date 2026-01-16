import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check, Plus, Search } from 'lucide-react'
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

  // Cegah render jika user belum siap (tunggu Layout)
  if (!user) return <Loader />

  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg({ type: 'loading', text: 'Memproses...' })
    try {
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': user.api_key },
        body: JSON.stringify({ subdomain: formData.name, recordType: formData.type, target: formData.target })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setMsg({ type: 'success', text: 'Subdomain aktif!' })
      setFormData({ name: '', type: 'A', target: '' })
      
      const { data: updated } = await supabase.from('subdomains').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (updated) setSubdomains(updated)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus subdomain ini?')) return
    await supabase.from('subdomains').delete().eq('id', id)
    setSubdomains(prev => prev.filter(item => item.id !== id))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 1500)
  }

  const filteredSubdomains = subdomains.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) return <Loader />

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10"><Globe className="text-blue-500" /> Kelola DNS</h2>
        {msg.text && <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 relative z-10 ${msg.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}><AlertCircle size={20} /><span>{msg.text}</span></div>}
        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Subdomain</label><div className="relative"><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:border-blue-500" placeholder="nama" /><div className="absolute right-4 top-3.5 text-xs text-slate-500">.domku.my.id</div></div></div>
            <div className="md:col-span-2 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white"><option value="A">A</option><option value="CNAME">CNAME</option><option value="AAAA">AAAA</option><option value="TXT">TXT</option></select></div>
            <div className="md:col-span-5 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Target</label><input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:border-blue-500" placeholder="192.168.1.1" /></div>
          </div>
          <button type="submit" disabled={msg.type === 'loading'} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">{msg.type === 'loading' ? <Loader /> : <><Plus size={20} /> Deploy</>}</button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-white">Active Domains ({subdomains.length}/30)</h3><div className="relative w-64"><Search className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111318] border border-blue-900/20 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500" /></div></div>
        {filteredSubdomains.length === 0 ? <div className="text-center py-10 text-slate-500 bg-[#111318] rounded-2xl border border-blue-900/20">Belum ada subdomain.</div> : 
          <div className="grid gap-3">
            {filteredSubdomains.map((item) => (
              <div key={item.id} className="bg-[#111318] border border-blue-900/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/40 transition-colors">
                <div className="flex-1 text-center md:text-left"><h4 className="font-bold text-white text-lg">{item.name}</h4><div className="flex justify-center md:justify-start gap-3 text-xs text-slate-400"><span className="bg-blue-900/30 px-2 py-0.5 rounded text-blue-300 font-mono">{item.type}</span><span className="font-mono">{item.target}</span></div></div>
                <div className="flex gap-2"><button onClick={() => copyToClipboard(item.name, item.id)} className="p-2 bg-[#0b0c10] text-slate-400 hover:text-white rounded-lg border border-blue-900/20">{copyStatus === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}</button><button onClick={() => handleDelete(item.id)} className="p-2 bg-red-900/10 text-red-400 hover:bg-red-900/20 rounded-lg border border-red-900/20"><Trash2 size={18} /></button></div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )
}

export default Dashboard

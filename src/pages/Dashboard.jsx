import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check, Plus, Search } from 'lucide-react'
import Loader from '../components/Loader'

const Dashboard = () => {
  const { user } = useOutletContext() // Ganti session ke user
  const navigate = useNavigate()
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
        const { data } = await supabase
          .from('subdomains')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (data) setSubdomains(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg({ type: 'loading', text: 'Menghubungi Cloudflare...' })
    
    try {
      const apiKey = user?.api_key
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
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
    if (!confirm('Yakin ingin menghapus subdomain ini?')) return
    await supabase.from('subdomains').delete().eq('id', id)
    setSubdomains(prev => prev.filter(item => item.id !== id))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 1500)
  }

  const filteredSubdomains = subdomains.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-500">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Kelola DNS</h2>
            <p className="text-slate-500 text-sm">Buat dan atur subdomain Cloudflare Anda.</p>
          </div>
        </div>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${msg.type === 'error' ? 'bg-red-900/10 border-red-500/20 text-red-400' : (msg.type === 'success' ? 'bg-green-900/10 border-green-500/20 text-green-400' : 'bg-blue-900/10 border-blue-500/20 text-blue-400')}`}>
            <AlertCircle size={20} />
            <span className="font-medium">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subdomain</label>
              <div className="relative group">
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-700" placeholder="nama-project" />
                <div className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono pointer-events-none group-focus-within:text-blue-400">.domku.my.id</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer">
                <option value="A">A</option>
                <option value="CNAME">CNAME</option>
                <option value="AAAA">AAAA</option>
                <option value="TXT">TXT</option>
              </select>
            </div>

            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target</label>
              <input type="text" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-all font-mono placeholder-slate-700" placeholder={formData.type === 'A' ? '192.168.1.1' : 'example.com'} />
            </div>
          </div>

          <button type="submit" disabled={msg.type === 'loading'} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {msg.type === 'loading' ? <Loader /> : <><Plus size={20} /> Deploy Subdomain</>}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Active Domains <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">{subdomains.length}/30</span>
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari domain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111318] border border-blue-900/20 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredSubdomains.length === 0 ? (
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-blue-900/20 border-dashed">
            <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Globe size={32} />
            </div>
            <p className="text-slate-400 font-medium">Belum ada subdomain ditemukan.</p>
            <p className="text-slate-600 text-sm mt-1">Buat subdomain pertama Anda di atas.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSubdomains.map((item) => (
              <div key={item.id} className="group bg-[#111318] border border-blue-900/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/40 transition-all hover:bg-[#161920]">
                <div className="flex-1 min-w-0 w-full text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h4 className="font-bold text-white truncate text-lg">{item.name}</h4>
                    <a href={`http://${item.name}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"><Globe size={14}/></a>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${item.type === 'A' ? 'bg-green-900/30 text-green-400' : 'bg-purple-900/30 text-purple-400'}`}>{item.type}</span>
                    <span className="font-mono text-slate-500">Target:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[200px]">{item.target}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                  <button onClick={() => copyToClipboard(item.name, item.id)} className="p-2.5 bg-[#0b0c10] text-slate-400 hover:text-white rounded-lg border border-blue-900/20 transition-colors tooltip" title="Salin Domain">
                    {copyStatus === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-900/5 text-red-400 hover:bg-red-900/20 rounded-lg border border-red-900/10 hover:border-red-500/30 transition-colors" title="Hapus">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

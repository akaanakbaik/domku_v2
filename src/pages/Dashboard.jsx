import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Globe, Trash2, Copy, AlertCircle, Check } from 'lucide-react'
import Loader from '../components/Loader'

const Dashboard = () => {
  const { session } = useOutletContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subdomains, setSubdomains] = useState([])
  const [formData, setFormData] = useState({ name: '', type: 'A', target: '' })
  const [apiKey, setApiKey] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [copyStatus, setCopyStatus] = useState(null)

  useEffect(() => {
    if (!session) {
      navigate('/auth')
      return
    }

    const fetchData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('api_key')
          .eq('id', session.user.id)
          .single()
        
        if (userData) setApiKey(userData.api_key)

        const { data: subData } = await supabase
          .from('subdomains')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (subData) setSubdomains(subData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, navigate])

  const handleCreate = async (e) => {
    e.preventDefault()
    setMsg({ type: 'loading', text: 'Memproses subdomain...' })
    
    try {
      const res = await fetch('/api/subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          subdomain: formData.name,
          recordType: formData.type,
          target: formData.target
        })
      })

      const result = await res.json()
      
      if (!result.success) throw new Error(result.error)

      setMsg({ type: 'success', text: 'Subdomain berhasil dibuat!' })
      setFormData({ name: '', type: 'A', target: '' })
      
      const { data: updatedList } = await supabase
        .from('subdomains')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        
      if (updatedList) setSubdomains(updatedList)

    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const handleDelete = async (id, cfId) => {
    if (!confirm('Hapus subdomain ini?')) return
    
    await supabase.from('subdomains').delete().eq('id', id)
    setSubdomains(prev => prev.filter(item => item.id !== id))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopyStatus(id)
    setTimeout(() => setCopyStatus(null), 2000)
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-[#111318] border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="text-blue-500" /> Buat Subdomain
        </h2>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : (msg.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-blue-900/20 border-blue-500/30 text-blue-400')}`}>
            <AlertCircle size={20} />
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Nama Subdomain</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                  placeholder="nama"
                />
                <div className="absolute top-[-25px] right-0 text-xs text-blue-400 font-mono">
                  {formData.name ? `${formData.name}.domku.my.id` : '...domku.my.id'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Tipe Record</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="A">A (IPv4)</option>
                <option value="CNAME">CNAME (Alias)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="TXT">TXT (Text)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Target / Tujuan</label>
            <input
              type="text"
              required
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full bg-[#0b0c10] border border-blue-900/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder={formData.type === 'A' ? '192.168.1.1' : 'example.com'}
            />
            {formData.name && formData.target && (
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-blue-400">{formData.name}.domku.my.id</span> menunjuk ke <span className="text-green-400">{formData.target}</span>
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={msg.type === 'loading'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {msg.type === 'loading' ? 'Memproses...' : 'Apply Subdomain'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-xl font-bold text-white mb-2">Riwayat ({subdomains.length}/30)</h3>
        {subdomains.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-[#111318] rounded-2xl border border-blue-900/20 border-dashed">
            Belum ada subdomain yang dibuat.
          </div>
        ) : (
          subdomains.map((item) => (
            <div key={item.id} className="bg-[#111318] border border-blue-900/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/40 transition-colors group">
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h4 className="font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 mt-1">
                  <span className="bg-blue-900/30 px-2 py-0.5 rounded text-blue-300 font-mono">{item.type}</span>
                  <span className="truncate max-w-[150px]">{item.target}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => copyToClipboard(item.name, item.id)}
                  className="p-2 bg-[#0b0c10] text-slate-400 hover:text-white rounded-lg border border-blue-900/20 transition-colors"
                >
                  {copyStatus === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button 
                  onClick={() => handleDelete(item.id, item.cf_id)}
                  className="p-2 bg-red-900/10 text-red-400 hover:bg-red-900/30 rounded-lg border border-red-900/20 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard

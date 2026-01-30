import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MailOpen, Bell, Clock, ShieldAlert, Globe, User, Info, CheckCircle2, AlertTriangle, Activity, Server, ArrowRight } from 'lucide-react'
import Loader from '../components/Loader'

const Notifications = () => {
  const { user } = useOutletContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
        if (!user) return
        try {
            const { data: sysNotifs } = await supabase.from('system_notifications').select('*').eq('is_active', true).order('created_at', { ascending: false })
            const { data: logs } = await supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)

            const combined = [
                ...(sysNotifs || []).map(n => ({ ...n, source: 'SYSTEM' })),
                ...(logs || []).map(l => ({ ...l, source: 'LOG' }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

            setItems(combined)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    fetchData()
  }, [user])

  const renderContent = (item) => {
    if (item.source === 'SYSTEM') {
        let icon = <Info size={16} className="text-blue-400"/>
        let borderColor = 'border-blue-500/20'
        let bgGradient = 'from-blue-500/5 to-blue-500/0'
        let badgeColor = 'bg-blue-500/10 text-blue-400'

        if(item.type === 'WARNING') { 
            icon = <AlertTriangle size={16} className="text-yellow-400"/>
            borderColor = 'border-yellow-500/20'
            bgGradient = 'from-yellow-500/5 to-yellow-500/0'
            badgeColor = 'bg-yellow-500/10 text-yellow-400'
        }
        if(item.type === 'ALERT') { 
            icon = <ShieldAlert size={16} className="text-red-400"/>
            borderColor = 'border-red-500/20'
            bgGradient = 'from-red-500/5 to-red-500/0'
            badgeColor = 'bg-red-500/10 text-red-400'
        }
        if(item.type === 'UPDATE') { 
            icon = <CheckCircle2 size={16} className="text-green-400"/>
            borderColor = 'border-green-500/20'
            bgGradient = 'from-green-500/5 to-green-500/0'
            badgeColor = 'bg-green-500/10 text-green-400'
        }

        return (
            <div className={`p-4 rounded-2xl border ${borderColor} bg-gradient-to-br ${bgGradient} flex flex-col gap-3 transition-all hover:border-opacity-50 group`}>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 border border-white/5 bg-[#111318]`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wider ${badgeColor}`}>{item.type}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                    </div>
                </div>
                {item.image_url && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-white/10 shadow-lg relative group-hover:scale-[1.01] transition-transform">
                        <img src={item.image_url} alt="Attachment" className="w-full h-auto object-cover max-h-56"/>
                    </div>
                )}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/5 mt-1">
                    <Clock size={10} className="text-slate-500"/>
                    <span className="text-[10px] text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        )
    }

    let content = { title: 'Aktivitas', desc: item.details, icon: <Activity size={14} className="text-slate-400"/>, bg: 'hover:bg-white/[0.02]' }

    if (item.action.includes('LOGIN')) content = { title: 'Login Detected', desc: `Masuk dari IP ${item.ip_address}`, icon: <User size={14} className="text-green-400"/>, bg: 'hover:bg-green-500/[0.02]' }
    if (item.action.includes('CREATE')) content = { title: 'Subdomain Created', desc: item.details, icon: <Globe size={14} className="text-blue-400"/>, bg: 'hover:bg-blue-500/[0.02]' }
    if (item.action.includes('DELETE')) content = { title: 'Subdomain Deleted', desc: item.details, icon: <ShieldAlert size={14} className="text-red-400"/>, bg: 'hover:bg-red-500/[0.02]' }

    return (
        <div className={`p-3 rounded-xl border border-white/5 bg-[#111318] flex items-center gap-3 transition-all ${content.bg} group`}>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">{content.icon}</div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-xs font-bold text-slate-200">{content.title}</h3>
                    <span className="text-[9px] text-slate-600 font-mono">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{content.desc}</p>
            </div>
        </div>
    )
  }

  if (!user) return null
  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between py-8 border-b border-white/5 mb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <MailOpen size={24} className="text-blue-400"/>
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Inbox</h1>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Server size={10}/> System Notifications & Logs
                </p>
            </div>
        </div>
        <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-white/10">
            {items.length} Messages
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <div className="p-4 bg-white/5 rounded-full mb-3"><Bell size={32} className="text-slate-500"/></div>
                <p className="text-slate-500 text-sm font-medium">Tidak ada pesan baru.</p>
            </div>
        ) : (
            items.map((item, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${i * 50}ms`}}>
                    {renderContent(item)}
                </div>
            ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-600">Menampilkan 20 aktivitas terakhir.</p>
        </div>
      )}
    </div>
  )
}

export default Notifications

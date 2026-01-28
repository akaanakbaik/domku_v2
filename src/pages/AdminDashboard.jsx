import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Shield, Users, Globe, Activity, Search, AlertTriangle, Trash2, Ban, Lock, Server, BarChart3, CheckCircle2, Zap, Power, Database, Settings, RefreshCw, XCircle, Bell, Plus, Image as ImageIcon, Send, Key, Eye, Terminal, Cpu, HardDrive, Wifi, AlertOctagon, X, Save, Layers, Fingerprint, ChevronDown, Download, FileText, List, Sliders, Calendar, UploadCloud, Check, MessageSquare, Clock, Map, Hash, TerminalSquare, StickyNote, LifeBuoy, ToggleLeft, ToggleRight, MoreHorizontal, UserCheck, ShieldAlert, Monitor, Folder, File, Command, Box, Play, RotateCcw, PenTool, LayoutTemplate, Mail, UserPlus, CreditCard } from 'lucide-react'
import Loader from '../components/Loader'
import { useToast } from '../context/ToastContext'

const CustomSelect = ({ options, value, onChange, icon: Icon, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white hover:border-white/30 transition-all outline-none group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-slate-400 group-hover:text-blue-400 transition-colors" />}
          <span className={selectedOption ? 'text-white' : 'text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${value === opt.value ? 'bg-white/10 text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                {opt.icon && <opt.icon size={12} />}
                {opt.label}
                {value === opt.value && <Check size={12} className="ml-auto text-blue-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = false }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          {isDanger && <AlertTriangle size={20} className="text-red-500"/>}
          {title}
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isDanger && <Trash2 size={14}/>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const InteractiveMap = () => {
  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center p-4 min-h-[250px]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a]"></div>
      <div className="grid grid-cols-8 gap-2 w-full h-full opacity-30">
         {Array.from({length: 48}).map((_, i) => (
           <div key={i} className="border border-white/5 rounded flex items-center justify-center">
             {Math.random() > 0.85 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>}
           </div>
         ))}
      </div>
      <div className="absolute top-4 left-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400">ID - Indonesia (85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span className="text-[10px] text-slate-400">US - United States (10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] text-slate-400">SG - Singapore (5%)</span>
        </div>
      </div>
    </div>
  )
}

const ServerVisualizer = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-2 h-32">
      {[...Array(16)].map((_, i) => {
        const loadLevel = (stats.server_load / 100) * 16
        const isActive = i < loadLevel
        const isHigh = i > 12
        return (
          <div key={i} className={`rounded border border-white/5 flex items-center justify-center transition-all duration-500 ${isActive ? (isHigh ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30') : 'bg-black/20'}`}>
            {isActive && <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isHigh ? 'bg-red-500' : 'bg-green-500'}`}></div>}
          </div>
        )
      })}
    </div>
  )
}

const FileManager = () => {
  const [files] = useState([
    { name: 'backup_v1.sql', size: '24MB', type: 'sql' },
    { name: 'error.log', size: '1.2MB', type: 'log' },
    { name: 'access.log', size: '4.5MB', type: 'log' },
    { name: 'config.json', size: '2KB', type: 'json' },
    { name: 'users_dump.csv', size: '150KB', type: 'csv' }
  ])
  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4 h-64 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Folder size={12}/> Server Storage</h4>
        <button className="p-1 hover:bg-white/10 rounded"><RefreshCw size={10} className="text-slate-500"/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {files.map((f, i) => (
          <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
            <div className="flex items-center gap-2">
              <File size={14} className="text-blue-500"/>
              <span className="text-xs text-slate-300 group-hover:text-white">{f.name}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">{f.size}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TerminalWindow = ({ logs, onCommand }) => {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!input.trim()) return
    onCommand(input)
    setInput('')
  }

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden font-mono text-[10px] flex flex-col h-80 shadow-2xl">
      <div className="bg-[#151515] px-4 py-2 border-b border-white/5 flex items-center gap-2 justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer"></div>
        </div>
        <span className="text-slate-600">root@domku-server:~</span>
        <TerminalSquare size={12} className="text-slate-600"/>
      </div>
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-1 bg-black/50 backdrop-blur">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'}`}>
            <span className="text-slate-600 select-none">{'>'}</span>
            <span>{log.msg}</span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <form onSubmit={handleSubmit} className="p-2 bg-[#151515] border-t border-white/5 flex items-center gap-2">
        <span className="text-green-500 font-bold">➜</span>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          className="flex-1 bg-transparent outline-none text-slate-200 placeholder-slate-700"
          placeholder="Enter system command (try: help, status, clear)..."
          autoFocus
        />
      </form>
    </div>
  )
}

const AdminDashboard = () => {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [themeColor, setThemeColor] = useState('red') 
  
  const [stats, setStats] = useState({
    users: 0, subdomains: 0, logs: 0, banned: 0, maintenance: false,
    server_load: 0, memory_usage: 0, disk_usage: 0, network_status: 'Online', db_status: 'Connected'
  })
  
  const [usersList, setUsersList] = useState([])
  const [notifications, setNotifications] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [logs, setLogs] = useState([])
  const [terminalLogs, setTerminalLogs] = useState([
    { msg: 'System initialized successfully.', type: 'info' },
    { msg: 'Connected to Supabase DB instance.', type: 'success' },
    { msg: 'Waiting for admin input...', type: 'info' }
  ])
  const [auditLogs, setAuditLogs] = useState([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [selectedUsers, setSelectedUsers] = useState([])
  
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'INFO', image_url: '' })
  const [ipForm, setIpForm] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [sqlQuery, setSqlQuery] = useState('')
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null, isDanger: false })
  const [apiKeyModal, setApiKeyModal] = useState(null)
  
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Email': user?.email }

  const checkAdminAccess = useCallback(() => {
    if (!user || user.email !== 'khaliqarrasyidabdul@gmail.com') {
      navigate('/', { replace: true })
      return false
    }
    return true
  }, [user, navigate])

  const addTermLog = (msg, type = 'info') => {
    setTerminalLogs(prev => [...prev.slice(-50), { msg, type }])
  }

  const addAuditLog = (action, target) => {
    const newLog = { id: Date.now(), action, target, date: new Date().toISOString() }
    setAuditLogs(prev => [newLog, ...prev])
  }

  const handleTerminalCommand = async (cmd) => {
    addTermLog(cmd, 'info')
    const command = cmd.toLowerCase().trim()

    if (command === 'clear') { setTerminalLogs([]); return }
    if (command === 'help') { addTermLog('Available: status, users, maintenance, clear, reboot, ping, sql', 'success'); return }
    if (command === 'status') { addTermLog(`CPU: ${stats.server_load}% | RAM: ${stats.memory_usage}% | DB: ${stats.db_status}`, 'info'); return }
    if (command === 'users') { addTermLog(`Total Users: ${usersList.length} | Active: ${usersList.filter(u=>u.subdomains?.length>0).length}`, 'info'); return }
    if (command === 'reboot') {
        addTermLog('Initiating system reboot...', 'error')
        setTimeout(() => addTermLog('Reboot sequence cancelled (Simulation).', 'success'), 2000)
        return
    }
    if (command === 'ping') {
        addTermLog('Pinging Cloudflare DNS...', 'info')
        setTimeout(() => addTermLog('Pong! 14ms', 'success'), 500)
        return
    }
    addTermLog(`Command not found: ${command}`, 'error')
  }

  const fetchData = useCallback(async () => {
    if (!checkAdminAccess()) return
    try {
      setRefreshing(true)
      const [resStats, resUsers, resNotif, resBlack] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/notifications', { headers }),
        fetch('/api/admin/blacklist', { headers })
      ])

      const dStats = await resStats.json()
      const dUsers = await resUsers.json()
      const dNotif = await resNotif.json()
      const dBlack = await resBlack.json()

      if (dStats.success) { setStats(dStats.stats); setLogs(dStats.logs) }
      if (dUsers.success) setUsersList(dUsers.users)
      if (dNotif.success) setNotifications(dNotif.data)
      if (dBlack.success) setBlacklist(dBlack.data)

    } catch (error) {
      addToast('error', 'Sync failed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [checkAdminAccess])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false })
  
  const openConfirm = (title, message, action, isDanger = false) => {
    setModalConfig({ isOpen: true, title, message, action, isDanger })
  }

  const handleConfirmAction = async () => {
    if (modalConfig.action) await modalConfig.action()
    closeModal()
  }

  const toggleMaintenance = async () => {
    try {
      const newVal = !stats.maintenance
      await fetch('/api/admin/settings/update', { 
        method: 'POST', headers,
        body: JSON.stringify({ key: 'maintenance_mode', value: newVal.toString() })
      })
      setStats(prev => ({ ...prev, maintenance: newVal }))
      addToast('success', `Maintenance ${newVal ? 'ENABLED' : 'DISABLED'}`)
      addTermLog(`Maintenance mode set to ${newVal}`, 'warning')
      addAuditLog('MAINTENANCE_TOGGLE', newVal ? 'ON' : 'OFF')
    } catch (e) { addToast('error', 'Failed') }
  }

  const handleRegenerateKey = async () => {
    if (!apiKeyModal) return
    try {
      const res = await fetch('/api/admin/god-action', {
        method: 'POST', 
        headers,
        body: JSON.stringify({ action: 'REGENERATE_KEY', payload: { userId: apiKeyModal.id } })
      })
      const data = await res.json()
      if (data.success) {
        addToast('success', 'API Key Regenerated')
        addTermLog(`Key rotated for user ${apiKeyModal.email}`, 'success')
        addAuditLog('REGENERATE_KEY', apiKeyModal.email)
        setApiKeyModal(null)
        fetchData()
      } else {
        throw new Error(data.error || 'Server rejected request')
      }
    } catch (e) { addToast('error', 'Failed: ' + e.message) }
  }

  const handleBanUser = async (id, email) => {
    try {
      const res = await fetch('/api/admin/god-action', {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'BAN_USER', payload: { userId: id, email } })
      })
      if ((await res.json()).success) {
        addToast('success', 'User Banned')
        addTermLog(`User ${email} has been wiped`, 'error')
        addAuditLog('BAN_USER', email)
        setUsersList(prev => prev.filter(u => u.id !== id))
      }
    } catch (e) { addToast('error', e.message) }
  }

  const handleBulkAction = async (action) => {
    try {
      for (const userId of selectedUsers) {
        if (action === 'BAN') {
            await fetch('/api/admin/god-action', {
                method: 'POST', headers,
                body: JSON.stringify({ action: 'BAN_USER', payload: { userId, email: 'bulk_action' } })
            })
        }
      }
      addToast('success', `Bulk ${action} completed`)
      setSelectedUsers([])
      fetchData()
      addAuditLog('BULK_ACTION', `${action} ${selectedUsers.length} users`)
    } catch (e) { addToast('error', 'Bulk action failed') }
  }

  const handlePostNotif = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST', headers,
        body: JSON.stringify(notifForm)
      })
      if ((await res.json()).success) {
        addToast('success', 'Broadcast sent')
        setNotifForm({ title: '', message: '', type: 'INFO', image_url: '' })
        fetchData()
        addTermLog(`Broadcast sent: ${notifForm.title}`)
        addAuditLog('BROADCAST', notifForm.title)
      }
    } catch (e) { addToast('error', 'Failed') }
  }

  const handleDeleteNotif = async (id) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE', headers })
      setNotifications(prev => prev.filter(n => n.id !== id))
      addToast('success', 'Deleted')
    } catch (e) { addToast('error', 'Failed') }
  }

  const handleBanIp = async () => {
    if (!ipForm) return
    try {
      await fetch('/api/admin/blacklist', {
        method: 'POST', headers,
        body: JSON.stringify({ ip: ipForm, reason: 'Manual Admin Ban' })
      })
      setIpForm('')
      fetchData()
      addToast('success', 'IP Blacklisted')
      addAuditLog('BAN_IP', ipForm)
    } catch (e) { addToast('error', 'Failed') }
  }

  const filteredUsers = usersList.filter(u => {
    const match = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterType === 'ALL') return match
    if (filterType === 'HIGH') return match && u.risk_score === 'HIGH'
    return match
  })

  const getTheme = () => {
    if(themeColor === 'blue') return 'from-blue-600 to-blue-900 border-blue-900/20 shadow-blue-900/20'
    if(themeColor === 'purple') return 'from-purple-600 to-purple-900 border-purple-900/20 shadow-purple-900/20'
    if(themeColor === 'green') return 'from-green-600 to-green-900 border-green-900/20 shadow-green-900/20'
    return 'from-red-600 to-red-900 border-red-900/20 shadow-red-900/20'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] text-red-600 font-mono tracking-widest relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <Shield size={80} className="animate-pulse mb-6 text-red-600 filter drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]"/>
        <h1 className="text-4xl font-black mb-2 animate-bounce">GOD MODE v6</h1>
        <p className="text-xs text-red-800">ESTABLISHING NEURAL LINK...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-slate-300 selection:bg-white/20 selection:text-white">
      
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={handleConfirmAction}
        onCancel={closeModal}
        isDanger={modalConfig.isDanger}
        confirmText={modalConfig.isDanger ? 'Execute' : 'Confirm'}
      />

      <div className={`sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl`}>
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 bg-gradient-to-br ${getTheme()} rounded-xl text-white shadow-lg animate-pulse relative group cursor-pointer`}>
                  <Shield size={20} className="relative z-10"/>
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-[0.2em] uppercase leading-none">God Mode</h1>
                  <p className="text-[9px] text-slate-500 font-mono tracking-wide mt-1 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${themeColor==='red'?'bg-red-500':themeColor==='blue'?'bg-blue-500':'bg-green-500'} animate-ping`}></span>
                    SYSTEM ONLINE
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"><Layers size={18}/></button>
            </div>

            <div className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex flex-wrap gap-2 w-full md:w-auto bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 overflow-x-auto no-scrollbar`}>
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'security', icon: Lock, label: 'Security' },
                { id: 'broadcast', icon: Bell, label: 'Comm' },
                { id: 'system', icon: Server, label: 'System' },
                { id: 'audit', icon: FileText, label: 'Audit' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex-1 md:flex-none justify-center whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <tab.icon size={12}/> {tab.label}
                </button>
              ))}
              <button onClick={fetchData} className={`px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${refreshing ? 'animate-spin' : ''}`}><RefreshCw size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 mt-6 md:mt-8 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Total Users', val: stats.users, icon: Users, col: 'text-blue-500' },
                { label: 'Subdomains', val: stats.subdomains, icon: Globe, col: 'text-purple-500' },
                { label: 'Total Logs', val: stats.logs, icon: Database, col: 'text-yellow-500' },
                { label: 'Banned', val: stats.banned, icon: Ban, col: 'text-red-500' }
              ].map((s, i) => (
                <div key={i} className="bg-[#0f1014] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${s.col}`}><s.icon size={60}/></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-3xl font-black text-white">{s.val}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Terminal size={14} className="text-green-500"/> System Terminal</h3>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <TerminalWindow logs={terminalLogs} onCommand={handleTerminalCommand} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InteractiveMap />
                    <FileManager />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6">
                  <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Settings size={14}/> Server Controls</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Maintenance</span>
                        <div className={`w-2 h-2 rounded-full ${stats.maintenance ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                      </div>
                      <button onClick={toggleMaintenance} className={`w-full py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${stats.maintenance ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                        <Power size={12}/> {stats.maintenance ? 'DISABLE MODE' : 'ENABLE MODE'}
                      </button>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">CPU Nodes Visualization</p>
                        <ServerVisualizer stats={stats} />
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Admin Notes</p>
                        <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-[10px] text-slate-300 resize-none h-20 outline-none" placeholder="Type notes here..."/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#0f1014] rounded-2xl border border-white/5 flex flex-col h-[85vh] animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500"/>
                  <h2 className="text-sm font-bold text-white uppercase">User Database</h2>
                  <span className="bg-white/10 text-white text-[9px] px-2 py-0.5 rounded-full">{usersList.length}</span>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                    <button onClick={() => openConfirm('Bulk Ban', `Ban ${selectedUsers.length} users?`, () => handleBulkAction('BAN'), true)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20">Bulk Ban</button>
                    <button onClick={() => setSelectedUsers([])} className="p-1.5 hover:text-white text-slate-500"><XCircle size={14}/></button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full lg:w-auto items-center">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-600" size={14}/>
                  <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-[10px] text-white outline-none focus:border-blue-500/50 transition-colors"/>
                </div>
                <div className="w-40">
                  <CustomSelect options={[{value:'ALL', label:'All Users'}, {value:'HIGH', label:'High Risk'}, {value:'WARNING', label:'Warning'}]} value={filterType} onChange={setFilterType} icon={Sliders}/>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {filteredUsers.map(u => (
                <div key={u.id} className={`bg-[#111] p-4 rounded-xl border ${selectedUsers.includes(u.id)?'border-blue-500/30 bg-blue-900/5':'border-white/5'} hover:border-white/20 transition-all group`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => setSelectedUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-blue-600 appearance-none border cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:inset-0 checked:after:m-auto checked:after:w-2 checked:after:h-2 checked:after:bg-blue-500 checked:after:rounded-sm"/>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xs font-bold text-white shadow-lg">{u.name.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{u.name}</h3>
                          {u.risk_score === 'HIGH' && <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded border border-red-500/20 font-bold animate-pulse">HIGH RISK</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold">Subs</p><p className="text-xs font-bold text-white">{u.subdomains[0]?.count || 0}</p></div>
                      <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold">Logs</p><p className="text-xs font-bold text-white">{u.activity_logs[0]?.count || 0}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setApiKeyModal(u); openConfirm('Regenerate API Key', `This will invalidate the old key for ${u.email}.`, handleRegenerateKey, false) }} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-500/20"><Key size={14}/></button>
                        <button onClick={() => openConfirm('Ban User', `Permanently delete ${u.email}?`, () => handleBanUser(u.id, u.email), true)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-500/20"><Ban size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
            <div className="lg:col-span-1 bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-fit">
              <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Send size={14} className="text-blue-500"/> Create Broadcast</h3>
              <form onSubmit={handlePostNotif} className="space-y-4">
                <input required placeholder="Title" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none transition-all"/>
                <textarea required placeholder="Message..." value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} rows="4" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none resize-none transition-all"/>
                <div className="grid grid-cols-2 gap-3">
                  <CustomSelect options={[{value:'INFO', label:'Info'}, {value:'ALERT', label:'Alert'}, {value:'UPDATE', label:'Update'}]} value={notifForm.type} onChange={v => setNotifForm({...notifForm, type: v})}/>
                  <input placeholder="Image URL" value={notifForm.image_url} onChange={e => setNotifForm({...notifForm, image_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"/>
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 transition-all">SEND BROADCAST</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase mb-2 flex items-center gap-2"><Bell size={14} className="text-yellow-500"/> Active Notifications</h3>
              <div className="grid grid-cols-1 gap-3">
                {notifications.map(n => (
                  <div key={n.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex gap-4 relative group hover:border-white/20 transition-all">
                    <button onClick={() => handleDeleteNotif(n.id)} className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                    {n.image_url && <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0"><img src={n.image_url} className="w-full h-full object-cover" alt="notif"/></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold text-black ${n.type==='ALERT'?'bg-red-500':n.type==='UPDATE'?'bg-green-500':'bg-blue-500'}`}>{n.type}</span>
                        <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{n.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && <div className="p-8 text-center border border-white/5 border-dashed rounded-xl"><p className="text-xs text-slate-500">No active broadcasts.</p></div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#0f1014] rounded-2xl border border-red-900/30 p-6 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5"><Ban size={100} className="text-red-500"/></div>
              <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Shield size={14} className="text-red-500"/> IP Blacklist</h3>
              <div className="flex gap-2 mb-6">
                <input placeholder="IP Address" value={ipForm} onChange={e => setIpForm(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-xs text-white focus:border-red-500 outline-none font-mono"/>
                <button onClick={handleBanIp} className="px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/20">BAN</button>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {blacklist.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 bg-red-950/10 border border-red-900/20 rounded-xl">
                    <div className="flex items-center gap-3"><Lock size={14} className="text-red-500"/><p className="text-xs font-bold text-red-200 font-mono">{b.ip_address}</p></div>
                    <button onClick={() => openConfirm('Unban IP', `Remove ${b.ip_address} from blacklist?`, () => handleUnbanIp(b.id), false)} className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded-lg"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 flex flex-col">
               <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Monitor size={14} className="text-blue-500"/> Session Manager</h3>
               <div className="space-y-2">
                 <div className="p-3 bg-white/[0.05] border border-white/10 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <div><p className="text-xs font-bold text-white">Current Session</p><p className="text-[10px] text-slate-500">IP: 103.20.x.x (ID)</p></div>
                    </div>
                    <span className="text-[10px] text-slate-400">Active Now</span>
                 </div>
                 <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center opacity-50">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                       <div><p className="text-xs font-bold text-white">Previous Session</p><p className="text-[10px] text-slate-500">2 hours ago</p></div>
                    </div>
                    <button className="text-[10px] text-red-500 hover:underline">Revoke</button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-8 text-center animate-in fade-in zoom-in duration-300">
             <div className="max-w-3xl mx-auto">
               <div className="flex items-center justify-center gap-3 mb-6"><Server size={48} className="text-slate-700"/><Database size={48} className="text-slate-700"/></div>
               <h3 className="text-lg font-bold text-white mb-2">System Maintenance Center</h3>
               <p className="text-xs text-slate-500 mb-8">Execute critical system functions. Actions are logged.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                 {[
                   { id: 'backup', label: 'Backup Database', icon: UploadCloud, desc: 'Create SQL Dump', col: 'text-blue-500' },
                   { id: 'optimize', label: 'Optimize Tables', icon: Zap, desc: 'Vacuum & Reindex', col: 'text-green-500' },
                   { id: 'cache', label: 'Clear Cache', icon: RefreshCw, desc: 'Purge Redis', col: 'text-yellow-500' },
                   { id: 'logs', label: 'Prune Logs', icon: Trash2, desc: 'Delete > 30 days', col: 'text-red-500' }
                 ].map((action) => (
                   <button key={action.id} onClick={() => addTermLog(`Executing ${action.label}...`)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center gap-4 transition-all group text-left">
                     <div className={`p-3 bg-white/5 rounded-lg ${action.col} group-hover:scale-110 transition-transform`}><action.icon size={24}/></div>
                     <div><h4 className="text-sm font-bold text-white">{action.label}</h4><p className="text-[10px] text-slate-500">{action.desc}</p></div>
                   </button>
                 ))}
               </div>
               <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-left">
                 <h4 className="text-xs font-bold text-white mb-2">SQL Query Runner (Mock)</h4>
                 <div className="flex gap-2">
                   <input value={sqlQuery} onChange={e => setSqlQuery(e.target.value)} placeholder="SELECT * FROM users..." className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"/>
                   <button onClick={() => addTermLog(`Query Executed: ${sqlQuery}`)} className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">RUN</button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 animate-in fade-in zoom-in duration-300">
            <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><FileText size={14}/> Admin Audit Log</h3>
            <div className="space-y-2">
              {auditLogs.length === 0 && <p className="text-xs text-slate-600 text-center py-10">No recent admin actions.</p>}
              {auditLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-white mr-2">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">{new Date(log.date).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase mb-4">Dashboard Appearance</h3>
              <div className="flex gap-4">
                {['red', 'blue', 'purple', 'green'].map(color => (
                  <button key={color} onClick={() => setThemeColor(color)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${themeColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{backgroundColor: color === 'red' ? '#dc2626' : color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : '#9333ea'}}>
                    {themeColor === color && <Check size={16} className="text-white"/>}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6">
              <h3 className="text-xs font-bold text-white uppercase mb-4">Admin Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Email</label>
                  <input value={user.email} disabled className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-400 mt-1 cursor-not-allowed"/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white mt-1 outline-none focus:border-white/30"/>
                </div>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold">Update Profile</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard

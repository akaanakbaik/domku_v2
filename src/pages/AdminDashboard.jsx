import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Shield, Users, Globe, Activity, Search, Trash2, Ban, Lock, Server, Zap, Power, Database, Settings, RefreshCw, XCircle, Bell, Plus, Image as ImageIcon, Send, Key, Terminal, Cpu, HardDrive, Wifi, Save, ChevronDown, Check, FileText, LayoutTemplate, Radio, Monitor, Clock, Calendar, CheckCircle2, AlertTriangle, MousePointer2, StickyNote, Eraser, PenTool, UploadCloud, Folder, File, FolderPlus, Sidebar } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

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
        className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white hover:border-white/30 transition-all outline-none group active:scale-[0.98]"
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

const AdminDashboard = () => {
  const outletContext = useOutletContext()
  const authContext = useAuth()
  const user = outletContext?.user || authContext?.user
  
  const { impersonate } = authContext
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const [stats, setStats] = useState({
    users: 0, subdomains: 0, logs: 0, banned: 0, maintenance: false,
    server_load: 0, memory_usage: 0, disk_usage: 0, network_status: 'Online', db_status: 'Connected',
    db_latency: 12, health_score: 98
  })

  const [trafficData, setTrafficData] = useState(Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 10))
  const [usersList, setUsersList] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [logs, setLogs] = useState([])
  
  const [popupConfig, setPopupConfig] = useState({ 
    active: false, 
    type: 'TEXT', 
    title: '', 
    message: '', 
    image: '', 
    btnText: 'Mengerti',
    duration: 'PERMANENT',
    expiresAt: null
  })

  const [notes, setNotes] = useState('')
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Security Logs', status: 'todo' },
    { id: 2, text: 'Backup Database', status: 'done' }
  ])
  const [newTask, setNewTask] = useState('')

  const [fileSystem, setFileSystem] = useState([
    { 
      id: 'root',
      name: 'root', 
      type: 'folder', 
      isOpen: true,
      children: [
        { 
          id: 'var',
          name: 'var', 
          type: 'folder', 
          isOpen: true,
          children: [
            { 
              id: 'www',
              name: 'www', 
              type: 'folder', 
              isOpen: false,
              children: [
                { id: 'index', name: 'index.html', type: 'file', size: '2KB' },
                { id: 'robots', name: 'robots.txt', type: 'file', size: '1KB' }
              ] 
            },
            { 
              id: 'logs',
              name: 'log', 
              type: 'folder', 
              isOpen: false,
              children: [
                { id: 'syslog', name: 'syslog', type: 'file', size: '14MB' }, 
                { id: 'authlog', name: 'auth.log', type: 'file', size: '2MB' }
              ] 
            }
          ]
        },
        { 
          id: 'etc',
          name: 'etc', 
          type: 'folder', 
          isOpen: false,
          children: [
            { id: 'nginx', name: 'nginx', type: 'folder', isOpen: false, children: [{ id: 'conf', name: 'nginx.conf', type: 'file', size: '4KB' }] },
            { id: 'hosts', name: 'hosts', type: 'file', size: '1KB' }
          ]
        },
        { 
          id: 'home',
          name: 'home', 
          type: 'folder', 
          isOpen: true,
          children: [
            { id: 'admin', name: 'admin', type: 'folder', isOpen: false, children: [{ id: 'backup', name: 'backup_v1.sql', type: 'file', size: '450MB' }] }
          ]
        }
      ]
    }
  ])

  const headers = { 'Content-Type': 'application/json', 'X-Admin-Email': user?.email }

  const checkAdminAccess = useCallback(() => {
    if (!user || user.email !== 'khaliqarrasyidabdul@gmail.com') {
      navigate('/', { replace: true })
      return false
    }
    return true
  }, [user, navigate])

  const fetchData = useCallback(async () => {
    if (!checkAdminAccess()) return
    try {
      const [resStats, resUsers, resBlack] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/blacklist', { headers })
      ])

      const dStats = await resStats.json()
      const dUsers = await resUsers.json()
      const dBlack = await resBlack.json()

      if (dStats.success) {
        setStats(prev => ({ ...prev, ...dStats.stats }))
        setLogs(dStats.logs)
      }
      if (dUsers.success) setUsersList(dUsers.users)
      if (dBlack.success) setBlacklist(dBlack.data)

    } catch (error) {
      addToast('error', 'Sync failed')
    } finally {
      setLoading(false)
    }
  }, [checkAdminAccess])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
        setCurrentTime(new Date())
        setTrafficData(prev => [...prev.slice(1), Math.floor(Math.random() * 60) + 20])
        setStats(prev => ({
            ...prev,
            server_load: Math.floor(Math.random() * 30) + 10,
            db_latency: Math.floor(Math.random() * 20) + 5
        }))
    }, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleSavePopup = async () => {
      let expiryDate = null
      const now = new Date()
      
      switch(popupConfig.duration) {
          case '1M': expiryDate = new Date(now.getTime() + 1 * 60000); break;
          case '5M': expiryDate = new Date(now.getTime() + 5 * 60000); break;
          case '30M': expiryDate = new Date(now.getTime() + 30 * 60000); break;
          case '1H': expiryDate = new Date(now.getTime() + 60 * 60000); break;
          case '1D': expiryDate = new Date(now.getTime() + 24 * 60 * 60000); break;
          case '1W': expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60000); break;
          case '1MO': expiryDate = new Date(now.setMonth(now.getMonth() + 1)); break;
          default: expiryDate = null;
      }

      const finalConfig = { ...popupConfig, expiresAt: expiryDate }

      try {
          await fetch('/api/admin/settings/update', {
              method: 'POST', headers,
              body: JSON.stringify({ key: 'global_popup', value: JSON.stringify(finalConfig) })
          })
          addToast('success', 'Konfigurasi Popup Disimpan')
      } catch (e) { addToast('error', 'Gagal menyimpan') }
  }

  const addTask = () => {
      if(!newTask) return
      setTasks([...tasks, { id: Date.now(), text: newTask, status: 'todo' }])
      setNewTask('')
  }

  const toggleTask = (id) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t))
  }

  const toggleFolder = (folderId) => {
      const toggleNode = (nodes) => {
          return nodes.map(node => {
              if (node.id === folderId) {
                  return { ...node, isOpen: !node.isOpen }
              }
              if (node.children) {
                  return { ...node, children: toggleNode(node.children) }
              }
              return node
          })
      }
      setFileSystem(toggleNode(fileSystem))
  }

  const renderFileSystem = (nodes, level = 0) => {
      return nodes.map(node => (
          <div key={node.id} style={{ paddingLeft: `${level * 12}px` }}>
              <div 
                className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-white/5 rounded text-xs transition-colors ${node.type === 'folder' ? 'text-yellow-500' : 'text-blue-400'}`}
                onClick={() => node.type === 'folder' && toggleFolder(node.id)}
              >
                  {node.type === 'folder' ? (
                      <>
                        {node.isOpen ? <ChevronDown size={12}/> : <ChevronDown size={12} className="-rotate-90"/>}
                        <Folder size={14} fill="currentColor" fillOpacity={0.2}/>
                      </>
                  ) : (
                      <File size={14}/>
                  )}
                  <span className="text-slate-300">{node.name}</span>
                  {node.type === 'file' && <span className="ml-auto text-[10px] text-slate-600">{node.size}</span>}
              </div>
              {node.type === 'folder' && node.isOpen && node.children && (
                  <div className="border-l border-white/5 ml-3">
                      {renderFileSystem(node.children, level + 1)}
                  </div>
              )}
          </div>
      ))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202]">
        <Shield size={64} className="animate-pulse text-red-600 mb-4"/>
        <h1 className="text-2xl font-black text-white tracking-widest">LOADING CORE...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-slate-300 selection:bg-red-900/30 selection:text-white">
      
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/20">
                  <Shield size={20}/>
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-widest uppercase leading-none">Admin Panel</h1>
                  <p className="text-[9px] text-red-500 font-mono font-bold mt-0.5">TITAN KERNEL V9.0</p>
                </div>
              </div>
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-lg border border-white/10"><LayoutTemplate size={18}/></button>
            </div>

            <div className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0`}>
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'popup', icon: LayoutTemplate, label: 'Popup Mgr' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'files', icon: Folder, label: 'Files' },
                { id: 'tools', icon: Settings, label: 'Tools' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === tab ? 'bg-red-600/10 text-red-500 border-red-500/50' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={12}/> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', val: stats.users, icon: Users, col: 'text-blue-500' },
                    { label: 'Latency', val: `${stats.db_latency}ms`, icon: Activity, col: 'text-green-500' },
                    { label: 'Health Score', val: `${stats.health_score}%`, icon: HeartRate, col: 'text-red-500' },
                    { label: 'Server Load', val: `${stats.server_load}%`, icon: Cpu, col: 'text-yellow-500' }
                ].map((s, i) => (
                    <div key={i} className="bg-[#0f1014] p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                        <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${s.col}`}><s.icon size={60}/></div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{s.label}</p>
                        <h3 className="text-2xl font-black text-white mt-1">{s.val}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-80 flex flex-col">
                    <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Globe size={14} className="text-blue-500"/> Live Traffic Monitor</h3>
                    <div className="flex-1 flex items-end gap-1 relative px-2">
                        {trafficData.map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-600/20 rounded-t-sm relative group hover:bg-blue-500/40 transition-colors" style={{height: `${h}%`}}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Task Board</h3>
                    <div className="flex gap-2 mb-4">
                        <input value={newTask} onChange={e => setNewTask(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500" placeholder="New task..."/>
                        <button onClick={addTask} className="bg-blue-600 px-3 rounded-lg text-white"><Plus size={14}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {tasks.map(t => (
                            <div key={t.id} onClick={() => toggleTask(t.id)} className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${t.status === 'done' ? 'bg-green-900/10 border-green-500/20 opacity-50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                <div className={`w-3 h-3 rounded-full border ${t.status === 'done' ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}></div>
                                <span className={`text-[10px] ${t.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{t.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
            <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-0 animate-in fade-in zoom-in duration-500 h-[80vh] flex flex-col overflow-hidden">
                <div className="bg-[#1a1b23] border-b border-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded text-[10px] text-slate-400 font-mono border border-white/5 w-64">
                            <span className="text-green-500">admin@domku</span>
                            <span>:</span>
                            <span className="text-blue-400">~/var/www</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><UploadCloud size={14}/></button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><FolderPlus size={14}/></button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Settings size={14}/></button>
                    </div>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className={`w-64 bg-[#111216] border-r border-white/5 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? '-ml-64' : ''}`}>
                        <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explorer</div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            {renderFileSystem(fileSystem)}
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-[#0a0a0a] relative flex flex-col">
                        <div className="flex items-center gap-2 p-2 border-b border-white/5 text-[10px] text-slate-400">
                            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1 hover:bg-white/10 rounded"><Sidebar size={14}/></button>
                            <span className="text-slate-600">|</span>
                            <span>Name</span>
                            <span className="ml-auto mr-20">Size</span>
                            <span className="mr-4">Type</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 content-start">
                            {['backup.sql', 'error.log', 'access.log', '.env', 'images/', 'public/', 'src/', 'package.json', 'README.md', 'yarn.lock'].map((f, i) => (
                                <div key={i} className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-all hover:scale-105">
                                    <div className="w-12 h-12 flex items-center justify-center text-4xl shadow-lg relative">
                                        {f.endsWith('/') ? 
                                            <Folder className="text-yellow-500 fill-yellow-500/20 w-full h-full"/> : 
                                            f.endsWith('.sql') ? <Database className="text-blue-400 w-full h-full"/> :
                                            <FileText className="text-slate-400 w-full h-full"/>
                                        }
                                    </div>
                                    <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center group-hover:text-white">{f}</span>
                                </div>
                            ))}
                        </div>
                        <div className="h-6 bg-[#1a1b23] border-t border-white/5 flex items-center px-3 justify-between text-[9px] text-slate-500">
                            <span>12 items selected</span>
                            <span>450 MB Total</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'popup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><LayoutTemplate size={14} className="text-purple-500"/> Popup Configuration</h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${popupConfig.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {popupConfig.active ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipe Popup</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['TEXT', 'IMAGE', 'MIXED'].map(type => (
                                    <button key={type} onClick={() => setPopupConfig({...popupConfig, type})} className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${popupConfig.type === type ? 'bg-purple-600 text-white border-purple-500' : 'bg-black/40 text-slate-400 border-white/5'}`}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Judul & Pesan</label>
                            <input value={popupConfig.title} onChange={e => setPopupConfig({...popupConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-2 outline-none focus:border-purple-500 transition-colors" placeholder="Judul Popup"/>
                            <textarea value={popupConfig.message} onChange={e => setPopupConfig({...popupConfig, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors resize-none" rows="3" placeholder="Isi pesan popup..."/>
                        </div>

                        {(popupConfig.type === 'IMAGE' || popupConfig.type === 'MIXED') && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">URL Gambar</label>
                                <div className="flex gap-2">
                                    <input value={popupConfig.image} onChange={e => setPopupConfig({...popupConfig, image: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors" placeholder="https://..."/>
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/10"><ImageIcon size={14} className="text-slate-400"/></div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Durasi Aktif</label>
                            <CustomSelect 
                                options={[
                                    {value: '1M', label: '1 Menit'}, {value: '5M', label: '5 Menit'}, {value: '30M', label: '30 Menit'},
                                    {value: '1H', label: '1 Jam'}, {value: '1D', label: '1 Hari'}, {value: '1W', label: '1 Minggu'},
                                    {value: '1MO', label: '1 Bulan'}, {value: 'PERMANENT', label: 'Permanen'}
                                ]} 
                                value={popupConfig.duration} 
                                onChange={val => setPopupConfig({...popupConfig, duration: val})} 
                                icon={Clock}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={() => setPopupConfig({...popupConfig, active: !popupConfig.active})} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${popupConfig.active ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'}`}>
                                {popupConfig.active ? 'Matikan Popup' : 'Aktifkan Popup'}
                            </button>
                            <button onClick={handleSavePopup} className="py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                <Save size={14}/> Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                    <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-slate-300">LIVE PREVIEW</div>
                    
                    <div className="relative bg-[#1a1b23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-90 md:scale-100">
                        <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full text-slate-400"><XCircle size={14}/></div>
                        
                        {(popupConfig.type === 'IMAGE' || popupConfig.type === 'MIXED') && popupConfig.image && (
                            <div className="w-full h-32 bg-slate-800 relative overflow-hidden">
                                <img src={popupConfig.image} className="w-full h-full object-cover" alt="Preview"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] to-transparent"></div>
                            </div>
                        )}

                        <div className={`p-5 ${popupConfig.type !== 'TEXT' && popupConfig.image ? '-mt-8 relative z-10' : ''} text-center`}>
                            {popupConfig.type === 'TEXT' && (
                                <div className="mx-auto w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 text-blue-400 border border-blue-500/30"><Bell size={20}/></div>
                            )}
                            <h3 className="text-lg font-bold text-white mb-2">{popupConfig.title || 'Judul Popup'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">{popupConfig.message || 'Isi pesan popup akan muncul disini...'}</p>
                            <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-lg">{popupConfig.btnText}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0f1014] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><RefreshCw size={14} className="text-blue-500"/> Smart Cache Purge</h3>
                    <div className="space-y-2">
                        {['System Cache', 'User Sessions', 'CDN Assets', 'Log Buffer'].map(item => (
                            <div key={item} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-300">{item}</span>
                                <button className="text-[9px] font-bold bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors">PURGE</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0f1014] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><StickyNote size={14} className="text-yellow-500"/> Admin Notes</h3>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-32 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-100 placeholder-yellow-500/30 outline-none resize-none" placeholder="Catatan penting admin..."/>
                    <button className="w-full py-2 bg-yellow-600/20 text-yellow-500 rounded-lg text-[10px] font-bold hover:bg-yellow-600 hover:text-white transition-colors">Simpan Catatan</button>
                </div>

                <div className="bg-[#0f1014] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Calendar size={14} className="text-red-500"/> Maintenance Scheduler</h3>
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                        <div className="text-2xl font-black text-red-500 mb-1">{stats.maintenance ? 'ON' : 'OFF'}</div>
                        <p className="text-[10px] text-slate-500">Status Maintenance Saat Ini</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 border border-white/5">Schedule 1H</button>
                        <button className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 border border-white/5">Schedule 4H</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

const HeartRate = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/><path d="M12 5.36 8.8 8.56a2.82 2.82 0 1 1-4-4 2.82 2.82 0 0 1 4 0l.2.2.2-.2a2.82 2.82 0 1 1 4 4 2.82 2.82 0 0 1-4 0L12 5.36z"/></svg>
)

export default AdminDashboard
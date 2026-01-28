import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Shield, Users, Globe, Activity, Search, Trash2, Ban, Lock, Server, Zap, Power, Database, Settings, RefreshCw, XCircle, Bell, Plus, Image as ImageIcon, Send, Key, Terminal, Cpu, HardDrive, Wifi, Save, ChevronDown, Check, FileText, LayoutTemplate, Radio, Monitor, Clock, Calendar, CheckCircle2, AlertTriangle, MousePointer2, StickyNote, Eraser, PenTool, UploadCloud, Folder, File, FolderPlus, Sidebar, MoreHorizontal, Download, X, ArrowRight, ArrowUp, ArrowDown, Filter, Layers, CreditCard, PieChart, BarChart3, UserCheck, UserX, Menu, Command, Laptop, Smartphone, Eye, LogOut, Moon, Sun, Grip, List, Archive, Unlock } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

const Modal = ({ isOpen, onClose, title, children, footer, type = 'default', size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full m-4'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full ${sizeClasses[size]} bg-[#0a0b0e] border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${type === 'danger' ? 'border-red-500/30' : 'border-white/10'}`}>
        <div className={`px-5 py-4 border-b flex justify-between items-center ${type === 'danger' ? 'border-red-500/10 bg-red-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
          <h3 className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${type === 'danger' ? 'text-red-500' : 'text-white'}`}>
            {type === 'danger' && <AlertTriangle size={14}/>}
            {title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-white/5 bg-[#050608] flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

const CustomSelect = ({ options, value, onChange, icon: Icon, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setIsOpen(false))

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#111318] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white hover:border-white/20 transition-all outline-none group active:scale-[0.99] shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />}
          <span className={`truncate ${selectedOption ? 'text-slate-200' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={12} className={`text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#16181d] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/50">
          <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] flex items-center gap-2 transition-colors ${value === opt.value ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {opt.icon && <opt.icon size={12} className="shrink-0" />}
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check size={10} className="ml-auto text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CustomToggle = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!checked)}>
        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${checked ? 'left-4.5 translate-x-full ml-[-2px]' : 'left-0.5'}`}></div>
        </div>
    </div>
)

const TrafficChart = ({ data }) => {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px] h-full w-full px-1 pb-1">
      {data.map((value, i) => {
        const height = (value / max) * 100
        const isHigh = height > 80
        return (
          <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
            <div 
              className={`w-full rounded-t-[1px] transition-all duration-500 ease-in-out relative ${isHigh ? 'bg-red-500/50' : 'bg-blue-500/30 group-hover:bg-blue-400/50'}`} 
              style={{ height: `${height}%` }}
            >
                <div className={`absolute top-0 w-full h-[1px] ${isHigh ? 'bg-red-400' : 'bg-blue-400'} opacity-50`}></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
    <div className={`p-4 rounded-xl border relative overflow-hidden group transition-all hover:-translate-y-0.5 ${
        color === 'blue' ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40' :
        color === 'green' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' :
        color === 'red' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' :
        color === 'yellow' ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40' :
        'bg-slate-500/5 border-slate-500/20'
    }`}>
        <div className={`absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 ${
            color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-green-500' : color === 'red' ? 'text-red-500' : 'text-yellow-500'
        }`}>
            <Icon size={60}/>
        </div>
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className={
                color === 'blue' ? 'text-blue-400' : color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-yellow-400'
            }/>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        </div>
        <h3 className="text-xl font-black text-white mt-1">{value}</h3>
        {subValue && <p className="text-[9px] text-slate-500 mt-1 font-mono">{subValue}</p>}
    </div>
)

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
  
  const [stats, setStats] = useState({
    users: 0, subdomains: 0, logs: 0, banned: 0, maintenance: false,
    server_load: 0, memory_usage: 0, disk_usage: 0, network_status: 'Online', db_status: 'Connected',
    db_latency: 12, health_score: 98, version: '10.0.0-RC1'
  })

  const [trafficData, setTrafficData] = useState(Array.from({ length: 40 }, () => Math.floor(Math.random() * 30) + 10))
  const [usersList, setUsersList] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [logs, setLogs] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  const [selectedUsers, setSelectedUsers] = useState([])
  
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

  const [modalState, setModalState] = useState({ type: null, data: null })
  const [notes, setNotes] = useState('')
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Audit System Logs', status: 'todo', priority: 'high' },
    { id: 2, text: 'Backup SQL Database', status: 'done', priority: 'medium' },
    { id: 3, text: 'Renew SSL Certificates', status: 'todo', priority: 'low' }
  ])
  const [newTask, setNewTask] = useState('')

  const [fileSystem, setFileSystem] = useState([
    { id: 'root', name: 'root', type: 'folder', isOpen: true, level: 0, children: [
        { id: 'var', name: 'var', type: 'folder', isOpen: false, level: 1, children: [
            { id: 'www', name: 'www', type: 'folder', isOpen: false, level: 2, children: [] },
            { id: 'logs', name: 'logs', type: 'folder', isOpen: false, level: 2, children: [
                { id: 'access', name: 'access.log', type: 'file', size: '24MB' },
                { id: 'error', name: 'error.log', type: 'file', size: '1.2MB' }
            ]}
        ]},
        { id: 'etc', name: 'etc', type: 'folder', isOpen: false, level: 1, children: [] },
        { id: 'home', name: 'home', type: 'folder', isOpen: true, level: 1, children: [
            { id: 'admin', name: 'admin', type: 'folder', isOpen: true, level: 2, children: [
                { id: 'backup', name: 'db_backup_v2.sql', type: 'file', size: '128MB' },
                { id: 'config', name: 'config.json', type: 'file', size: '2KB' }
            ]}
        ]}
    ]}
  ])

  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', text: 'Initializing Titan Kernel v10.0...' },
    { type: 'success', text: 'Connected to Database Shard #01' },
    { type: 'info', text: 'Security Modules: Active' },
    { type: 'warning', text: '5 IP addresses flagged for review' }
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const terminalEndRef = useRef(null)

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
      if (dUsers.success) {
          setUsersList(dUsers.users)
          setFilteredUsers(dUsers.users)
      }
      if (dBlack.success) setBlacklist(dBlack.data)

    } catch (error) {
      addToast('error', 'Gagal sinkronisasi data')
    } finally {
      setLoading(false)
    }
  }, [checkAdminAccess])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
        setCurrentTime(new Date())
        setTrafficData(prev => {
            const next = [...prev.slice(1), Math.floor(Math.random() * 80) + 10]
            return next
        })
        setStats(prev => ({
            ...prev,
            server_load: Math.floor(Math.random() * 40) + 10,
            db_latency: Math.floor(Math.random() * 15) + 5,
            memory_usage: Math.floor(Math.random() * 20) + 40
        }))
    }, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
      const filtered = usersList.filter(u => {
          const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
          const matchFilter = userFilter === 'ALL' ? true : userFilter === 'HIGH' ? u.risk_score === 'HIGH' : u.risk_score === 'MEDIUM'
          return matchSearch && matchFilter
      })
      setFilteredUsers(filtered)
  }, [userSearch, userFilter, usersList])

  useEffect(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalOutput])

  const handleSavePopup = async () => {
      let expiryDate = null
      const now = new Date()
      
      switch(popupConfig.duration) {
          case '1M': expiryDate = new Date(now.getTime() + 60000); break;
          case '5M': expiryDate = new Date(now.getTime() + 300000); break;
          case '30M': expiryDate = new Date(now.getTime() + 1800000); break;
          case '1H': expiryDate = new Date(now.getTime() + 3600000); break;
          case '1D': expiryDate = new Date(now.getTime() + 86400000); break;
          case '1W': expiryDate = new Date(now.getTime() + 604800000); break;
          case '1MO': expiryDate = new Date(now.setMonth(now.getMonth() + 1)); break;
          default: expiryDate = null;
      }

      const finalConfig = { ...popupConfig, expiresAt: expiryDate }

      try {
          await fetch('/api/admin/settings/update', {
              method: 'POST', headers,
              body: JSON.stringify({ key: 'global_popup', value: JSON.stringify(finalConfig) })
          })
          addToast('success', 'Konfigurasi Popup Tersimpan')
      } catch (e) { addToast('error', 'Gagal menyimpan') }
  }

  const handleTerminalCommand = (e) => {
      e.preventDefault()
      if(!terminalInput.trim()) return
      const cmd = terminalInput.trim().toLowerCase()
      
      setTerminalOutput(prev => [...prev, { type: 'command', text: `root@titan:~# ${cmd}` }])
      
      setTimeout(() => {
          if(cmd === 'clear') setTerminalOutput([])
          else if(cmd === 'help') setTerminalOutput(prev => [...prev, { type: 'info', text: 'Commands: status, users, scan, purge, reboot, help, clear' }])
          else if(cmd === 'status') setTerminalOutput(prev => [...prev, { type: 'success', text: `CPU: ${stats.server_load}% | RAM: ${stats.memory_usage}% | DB: ${stats.db_status}` }])
          else if(cmd === 'scan') setTerminalOutput(prev => [...prev, { type: 'warning', text: 'Scan complete. No threats found.' }])
          else if(cmd === 'users') setTerminalOutput(prev => [...prev, { type: 'info', text: `Total: ${usersList.length} | Active: ${usersList.length}` }])
          else setTerminalOutput(prev => [...prev, { type: 'error', text: `bash: ${cmd}: command not found` }])
      }, 200)
      setTerminalInput('')
  }

  const addTask = () => {
      if(!newTask) return
      setTasks([...tasks, { id: Date.now(), text: newTask, status: 'todo', priority: 'medium' }])
      setNewTask('')
  }

  const toggleTask = (id) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t))
  }

  const deleteTask = (id) => {
      setTasks(tasks.filter(t => t.id !== id))
  }

  const toggleFolder = (folderId) => {
      const toggle = (nodes) => nodes.map(node => {
          if (node.id === folderId) return { ...node, isOpen: !node.isOpen }
          if (node.children) return { ...node, children: toggle(node.children) }
          return node
      })
      setFileSystem(toggle(fileSystem))
  }

  const renderFileSystem = (nodes) => {
      return nodes.map(node => (
          <div key={node.id} style={{ paddingLeft: `${node.level * 12}px` }}>
              <div 
                className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-white/5 rounded-md text-[10px] transition-colors group ${node.type === 'folder' ? 'text-blue-200' : 'text-slate-400'}`}
                onClick={() => node.type === 'folder' && toggleFolder(node.id)}
              >
                  {node.type === 'folder' ? (
                      <>
                        <ChevronDown size={10} className={`transition-transform ${node.isOpen ? '' : '-rotate-90'}`}/>
                        <Folder size={12} className="text-blue-500 fill-blue-500/20"/>
                      </>
                  ) : (
                      <>
                        <span className="w-2.5"></span>
                        <File size={12} className="text-slate-500"/>
                      </>
                  )}
                  <span className="truncate flex-1">{node.name}</span>
                  {node.type === 'file' && <span className="text-[9px] text-slate-600 group-hover:text-slate-400">{node.size}</span>}
              </div>
              {node.type === 'folder' && node.isOpen && node.children && (
                  <div className="border-l border-white/5 ml-[11px] mt-0.5">
                      {renderFileSystem(node.children)}
                  </div>
              )}
          </div>
      ))
  }

  const handleBanUser = async () => {
      if(!modalState.data) return
      try {
          const res = await fetch('/api/admin/god-action', {
              method: 'POST', headers,
              body: JSON.stringify({ action: 'BAN_USER', payload: { userId: modalState.data.id, email: modalState.data.email } })
          })
          const d = await res.json()
          if(d.success) {
              addToast('success', 'User berhasil dibanned')
              setUsersList(prev => prev.filter(u => u.id !== modalState.data.id))
              setModalState({ type: null, data: null })
          }
      } catch(e) { addToast('error', 'Gagal melakukan aksi') }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202]">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Shield size={18} className="text-red-600"/></div>
        </div>
        <h1 className="text-xs font-bold text-red-600 tracking-[0.3em] mt-4 animate-pulse">TITAN CORE</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-slate-300 selection:bg-red-900/30 selection:text-white">
      
      {/* Modal - User Ban Confirmation */}
      <Modal 
        isOpen={modalState.type === 'BAN_USER'} 
        onClose={() => setModalState({ type: null, data: null })}
        title="KONFIRMASI TINDAKAN"
        type="danger"
        footer={
            <>
                <button onClick={() => setModalState({ type: null, data: null })} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-colors">BATAL</button>
                <button onClick={handleBanUser} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors shadow-lg shadow-red-900/20 flex items-center gap-1.5"><Trash2 size={10}/> EKSEKUSI</button>
            </>
        }
      >
        <div className="text-center py-2">
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
                <AlertTriangle size={20} className="text-red-500"/>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed px-2">
                Menghapus user <strong className="text-white font-mono bg-white/5 px-1 rounded">{modalState.data?.email}</strong> akan menghilangkan seluruh data dan subdomain secara permanen.
            </p>
        </div>
      </Modal>

      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[1920px] mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-700 to-red-900 rounded-lg text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Shield size={16}/>
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-widest uppercase leading-none">Titan<span className="text-red-600">Kernel</span></h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[8px] text-slate-500 font-mono font-bold">V{stats.version} • GOD MODE</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-lg border border-white/10 active:bg-white/10"><Menu size={16}/></button>
            </div>

            <div className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 items-center justify-start md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0 mt-2 md:mt-0`}>
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'popup', icon: LayoutTemplate, label: 'Popup' },
                { id: 'files', icon: Folder, label: 'Files' },
                { id: 'tools', icon: Settings, label: 'Tools' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${activeTab === tab ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={12}/> {tab.label}
                </button>
              ))}
              <div className="h-5 w-px bg-white/10 mx-1 hidden md:block"></div>
              <button onClick={fetchData} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"><RefreshCw size={12} className={loading ? 'animate-spin' : ''}/></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 mt-6 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Active Users" value={stats.users} icon={Users} color="blue" subValue="+12% Growth"/>
                <StatCard label="DB Latency" value={`${stats.db_latency}ms`} icon={Zap} color="yellow" subValue="Optimal"/>
                <StatCard label="Health Score" value={`${stats.health_score}%`} icon={HeartRate} color="green" subValue="System Stable"/>
                <StatCard label="Server Load" value={`${stats.server_load}%`} icon={Cpu} color="red" subValue={`${stats.memory_usage}% RAM`}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#0f1014] rounded-xl border border-white/5 p-1 flex flex-col h-64 relative overflow-hidden shadow-lg">
                    <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Live Traffic Matrix</span>
                    </div>
                    <div className="flex-1 pt-8 bg-gradient-to-b from-blue-900/5 to-transparent">
                        <TrafficChart data={trafficData} />
                    </div>
                    <div className="h-6 bg-[#0a0b0e] border-t border-white/5 flex items-center justify-between px-3 text-[9px] text-slate-600 font-mono uppercase">
                        <span>-60s</span>
                        <span>HTTP/WS Stream</span>
                        <span>Now</span>
                    </div>
                </div>

                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-4 flex flex-col h-64 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> System Tasks</h3>
                        <button onClick={addTask} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"><Plus size={12}/></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500 transition-colors placeholder-slate-600" placeholder="Add new task..."/>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                        {tasks.map(t => (
                            <div key={t.id} className={`group flex items-center gap-2 p-2 rounded-lg border transition-all ${t.status === 'done' ? 'bg-green-900/5 border-green-500/10 opacity-60' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                <div onClick={() => toggleTask(t.id)} className={`w-3 h-3 rounded-sm border cursor-pointer flex items-center justify-center transition-colors ${t.status === 'done' ? 'bg-green-500 border-green-500' : 'border-slate-600 hover:border-green-500'}`}>
                                    {t.status === 'done' && <Check size={8} className="text-black"/>}
                                </div>
                                <span className={`text-[10px] flex-1 ${t.status === 'done' ? 'line-through text-slate-500' : 'text-slate-300'}`}>{t.text}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={10}/></button>
                            </div>
                        ))}
                        {tasks.length === 0 && <div className="text-center py-8 text-[10px] text-slate-600 italic">No pending tasks</div>}
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
            <div className="bg-[#0f1014] rounded-xl border border-white/5 flex flex-col h-[75vh] animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden shadow-2xl">
                <div className="p-3 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-3 bg-[#0a0b0e]">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><Users size={14}/></div>
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">User Database</h2>
                            <p className="text-[9px] text-slate-500">{usersList.length} Accounts • {filteredUsers.length} Filtered</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-56 group">
                            <Search className="absolute left-2.5 top-2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={12} />
                            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-[#16181d] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600" placeholder="Search by name, email..."/>
                        </div>
                        <div className="flex bg-[#16181d] rounded-lg border border-white/10 p-0.5">
                            {['ALL', 'HIGH', 'MED'].map(f => (
                                <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${userFilter === f ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>{f}</button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#111318] text-slate-500 font-bold uppercase sticky top-0 z-10 border-b border-white/5">
                            <tr>
                                <th className="p-3 pl-4">User Identity</th>
                                <th className="p-3">Risk Score</th>
                                <th className="p-3">Subdomains</th>
                                <th className="p-3">Joined Date</th>
                                <th className="p-3 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white text-[10px] border border-white/10 shadow-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{u.name}</div>
                                                <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1"><Monitor size={8}/> {u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border flex items-center gap-1 w-fit ${u.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : u.risk_score === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                            {u.risk_score === 'HIGH' && <AlertTriangle size={8}/>}
                                            {u.risk_score}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-slate-400">{u.subdomains?.[0]?.count || 0} Records</td>
                                    <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="p-3 text-right pr-4">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => impersonate(u.id)} className="p-1.5 hover:bg-blue-500/20 rounded-md text-blue-400 transition-colors" title="Login As User"><UserCheck size={12}/></button>
                                            <button onClick={() => setModalState({ type: 'BAN_USER', data: u })} className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors" title="Ban User"><UserX size={12}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'popup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-5 h-fit shadow-lg">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><LayoutTemplate size={12} className="text-purple-500"/> Popup Configuration</h3>
                        <CustomToggle 
                            checked={popupConfig.active} 
                            onChange={(val) => setPopupConfig({...popupConfig, active: val})} 
                            label={popupConfig.active ? "LIVE STATUS: ON" : "LIVE STATUS: OFF"}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Tipe Popup</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['TEXT', 'IMAGE', 'MIXED'].map(type => (
                                    <button key={type} onClick={() => setPopupConfig({...popupConfig, type})} className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${popupConfig.type === type ? 'bg-purple-600 text-white border-purple-500 shadow-md' : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/10'}`}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Konten</label>
                            <input value={popupConfig.title} onChange={e => setPopupConfig({...popupConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white mb-2 outline-none focus:border-purple-500 transition-colors placeholder-slate-600" placeholder="Judul Popup..."/>
                            <textarea value={popupConfig.message} onChange={e => setPopupConfig({...popupConfig, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 transition-colors resize-none placeholder-slate-600" rows="3" placeholder="Pesan popup..."/>
                        </div>

                        {(popupConfig.type === 'IMAGE' || popupConfig.type === 'MIXED') && (
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">Media</label>
                                <div className="flex gap-2">
                                    <input value={popupConfig.image} onChange={e => setPopupConfig({...popupConfig, image: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 transition-colors placeholder-slate-600" placeholder="Image URL (https://...)"/>
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center w-9"><ImageIcon size={12} className="text-slate-400"/></div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Durasi</label>
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
                            <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Tombol Aksi</label>
                                <input value={popupConfig.btnText} onChange={e => setPopupConfig({...popupConfig, btnText: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 h-[38px] placeholder-slate-600"/>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button onClick={handleSavePopup} className="w-full py-2.5 bg-white text-black rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-white/10 active:scale-95">
                                <Save size={12}/> SIMPAN & TERAPKAN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] min-h-[350px] shadow-lg">
                    <div className="absolute top-4 left-4 bg-black/60 px-2 py-0.5 rounded border border-white/10 text-[8px] font-bold text-slate-300 uppercase tracking-wider backdrop-blur-md">Mobile Preview</div>
                    
                    <div className="relative bg-[#1a1b23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-[280px] overflow-hidden transform transition-all hover:scale-[1.02] ring-4 ring-black/20">
                        <div className="absolute top-3 right-3 p-1 bg-black/40 rounded-full text-slate-400 hover:text-white cursor-pointer"><X size={12}/></div>
                        
                        {(popupConfig.type === 'IMAGE' || popupConfig.type === 'MIXED') && popupConfig.image && (
                            <div className="w-full h-32 bg-slate-800 relative overflow-hidden">
                                <img src={popupConfig.image} className="w-full h-full object-cover" alt="Preview"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] to-transparent"></div>
                            </div>
                        )}

                        <div className={`p-5 ${popupConfig.type !== 'TEXT' && popupConfig.image ? '-mt-8 relative z-10' : ''} text-center`}>
                            {popupConfig.type === 'TEXT' && (
                                <div className="mx-auto w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 text-blue-400 border border-blue-500/30"><Bell size={18}/></div>
                            )}
                            <h3 className="text-sm font-bold text-white mb-2 leading-tight">{popupConfig.title || 'Judul Popup'}</h3>
                            <p className="text-[10px] text-slate-400 leading-relaxed mb-4 line-clamp-3">{popupConfig.message || 'Pesan anda akan muncul disini...'}</p>
                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-[10px] shadow-lg">{popupConfig.btnText}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'files' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[70vh]">
                <div className="bg-[#0f1014] rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-3 border-b border-white/5 bg-[#0a0b0e] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Folder size={12}/> File System</h3>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {renderFileSystem(fileSystem)}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-[#0f1014] rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-2 border-b border-white/5 bg-[#0a0b0e] flex items-center justify-between">
                        <div className="flex items-center gap-2 px-2">
                            <Terminal size={12} className="text-slate-500"/>
                            <span className="text-[9px] text-slate-500 font-mono">root@titan-kernel:~</span>
                        </div>
                        <span className="text-[9px] text-green-500 font-mono bg-green-500/10 px-2 rounded">SSH CONNECTED</span>
                    </div>
                    <div className="flex-1 bg-[#050505] p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar" onClick={() => document.getElementById('term-input').focus()}>
                        {terminalOutput.map((line, i) => (
                            <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'warning' ? 'text-yellow-400' : line.type === 'info' ? 'text-blue-400' : 'text-slate-300'}`}>
                                {line.type === 'command' ? <span className="text-slate-500 mr-2">$</span> : null}
                                {line.text}
                            </div>
                        ))}
                        <div ref={terminalEndRef}></div>
                    </div>
                    <form onSubmit={handleTerminalCommand} className="p-2 bg-[#0a0b0e] border-t border-white/5 flex items-center gap-2">
                        <span className="text-green-500 font-bold text-xs">➜</span>
                        <input id="term-input" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" autoComplete="off" autoFocus spellCheck="false"/>
                    </form>
                </div>
            </div>
        )}

        {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0f1014] p-5 rounded-xl border border-white/5 space-y-4 shadow-lg hover:border-blue-500/20 transition-colors">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><RefreshCw size={12} className="text-blue-500"/> Cache Control</h3>
                    <div className="space-y-2">
                        {['Redis Cache', 'CDN Assets', 'Session Store', 'Log Buffer'].map(item => (
                            <div key={item} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5 group hover:bg-white/10 transition-colors">
                                <span className="text-[10px] text-slate-300">{item}</span>
                                <button className="text-[9px] font-bold bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors">PURGE</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0f1014] p-5 rounded-xl border border-white/5 space-y-4 shadow-lg hover:border-yellow-500/20 transition-colors">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><StickyNote size={12} className="text-yellow-500"/> Admin Notes</h3>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-32 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-[10px] text-yellow-100 placeholder-yellow-500/30 outline-none resize-none custom-scrollbar" placeholder="Tulis catatan penting..."/>
                    <button className="w-full py-2 bg-yellow-600/20 text-yellow-500 rounded-lg text-[9px] font-bold hover:bg-yellow-600 hover:text-white transition-colors flex items-center justify-center gap-1"><Save size={10}/> Simpan Catatan</button>
                </div>

                <div className="bg-[#0f1014] p-5 rounded-xl border border-white/5 space-y-4 shadow-lg hover:border-red-500/20 transition-colors">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Calendar size={12} className="text-red-500"/> Maintenance</h3>
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                        <div className="text-xl font-black text-red-500 mb-0.5">{stats.maintenance ? 'ACTIVE' : 'INACTIVE'}</div>
                        <p className="text-[9px] text-slate-500">Public Access Status</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-slate-300 border border-white/5 hover:border-white/20 transition-colors">Schedule 1H</button>
                        <button className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-slate-300 border border-white/5 hover:border-white/20 transition-colors">Schedule 4H</button>
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
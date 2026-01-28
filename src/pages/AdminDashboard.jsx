import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { 
  Shield, Users, Globe, Activity, Search, AlertTriangle, Trash2, Ban, Lock, Server, 
  BarChart3, CheckCircle2, Zap, Power, Database, Settings, RefreshCw, XCircle, Bell, 
  Plus, Image as ImageIcon, Send, Key, Eye, Terminal, Cpu, HardDrive, Wifi, AlertOctagon, 
  X, Save, Layers, Fingerprint, ChevronDown, Download, FileText, List, Sliders, 
  Calendar, UploadCloud, Check, MessageSquare, Clock, Map, Hash, TerminalSquare, 
  StickyNote, LifeBuoy, ToggleLeft, ToggleRight, MoreHorizontal, UserCheck, ShieldAlert, 
  Monitor, Folder, File, Command, Box, Play, RotateCcw, PenTool, LayoutTemplate, 
  Mail, UserPlus, CreditCard, ChevronRight, Archive, Inbox, Tag, Move, LayoutDashboard
} from 'lucide-react'
import { useToast } from '../context/ToastContext'

/**
 * =================================================================================================
 * UTILITY FUNCTIONS & HOOKS
 * =================================================================================================
 */

// Hook untuk mendeteksi klik di luar elemen
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
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

// Format angka ke format mata uang/angka cantik
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num)

// Format bytes ke ukuran file
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * =================================================================================================
 * INTERNAL UI COMPONENTS (DESIGN SYSTEM)
 * =================================================================================================
 */

// 1. Custom Modal Component
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', type = 'default' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw]'
  }

  const borderClass = type === 'danger' ? 'border-red-500/30' : 'border-white/10'
  const headerClass = type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full ${sizeClasses[size]} bg-[#0a0b0e] border ${borderClass} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}>
        <div className={`px-5 py-4 border-b ${headerClass} flex justify-between items-center`}>
          <h3 className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${type === 'danger' ? 'text-red-500' : 'text-white'}`}>
            {type === 'danger' && <AlertTriangle size={14}/>}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar relative flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-white/5 bg-[#08080a] flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// 2. Custom Select Dropdown
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
        className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white hover:border-white/20 transition-all outline-none group active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />}
          <span className={`truncate ${selectedOption ? 'text-slate-200' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#161618] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/50">
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

// 3. Status Badge
const StatusBadge = ({ status, type = 'default' }) => {
  const styles = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  const className = styles[type] || styles.inactive
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 w-fit uppercase ${className}`}>
      <span className="w-1 h-1 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  )
}

// 4. Traffic Bar Chart Component (CSS-only visualization)
const TrafficChart = ({ data }) => {
  const max = Math.max(...data)
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

/**
 * =================================================================================================
 * MAIN PAGE COMPONENT: ADMIN DASHBOARD
 * =================================================================================================
 */

const AdminDashboard = () => {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // --- GLOBAL STATES ---
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [themeColor, setThemeColor] = useState('red') // red, blue, green, purple
  const [currentTime, setCurrentTime] = useState(new Date())

  // --- DATA STATES ---
  const [stats, setStats] = useState({
    users: 0, subdomains: 0, logs: 0, banned: 0, maintenance: false,
    server_load: 0, memory_usage: 0, disk_usage: 0, db_status: 'Connected',
    health_score: 98, version: '2.5.0-RC'
  })
  
  const [usersList, setUsersList] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [trafficData, setTrafficData] = useState(Array.from({length: 40}, () => Math.floor(Math.random() * 50) + 10))
  
  // --- FEATURE STATES ---
  const [fileSystem, setFileSystem] = useState([
    { id: 'root', name: 'root', type: 'folder', isOpen: true, level: 0, children: [
        { id: 'var', name: 'var', type: 'folder', isOpen: false, level: 1, children: [
            { id: 'logs', name: 'logs', type: 'folder', isOpen: false, level: 2, children: [
                { id: 'syslog', name: 'syslog', type: 'file', size: '24MB' },
                { id: 'auth', name: 'auth.log', type: 'file', size: '2MB' }
            ]}
        ]},
        { id: 'home', name: 'home', type: 'folder', isOpen: true, level: 1, children: [
            { id: 'admin', name: 'admin', type: 'folder', isOpen: true, level: 2, children: [
                { id: 'config', name: 'config.json', type: 'file', size: '4KB' },
                { id: 'backup', name: 'backup_v2.sql', type: 'file', size: '128MB' }
            ]}
        ]}
    ]}
  ])
  
  const [popupForm, setPopupForm] = useState({ active: false, title: '', message: '', type: 'text', image: '', position: 'center' })
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review System Logs', status: 'todo', priority: 'high' },
    { id: 2, title: 'Update SQL Schema', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Clear Redis Cache', status: 'done', priority: 'low' }
  ])
  const [newTaskText, setNewTaskText] = useState('')
  
  const [tickets, setTickets] = useState([
    { id: 101, user: 'alex_dev', subject: 'Domain Propagation Issue', status: 'open', time: '10m ago' },
    { id: 102, user: 'sarah_m', subject: 'Billing Inquiry', status: 'closed', time: '2h ago' }
  ])

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, action: null, type: 'default' })
  const [terminalOutput, setTerminalOutput] = useState([{ type: 'info', text: 'Titan Kernel v2.5.0 initialized...' }])
  const [terminalInput, setTerminalInput] = useState('')
  
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Email': user?.email }

  // --- ACCESS CONTROL ---
  const checkAdminAccess = useCallback(() => {
    // Simple mock check
    if (!user || user.email !== 'khaliqarrasyidabdul@gmail.com') {
      navigate('/', { replace: true })
      return false
    }
    return true
  }, [user, navigate])

  // --- DATA FETCHING & SIMULATION ---
  const fetchData = useCallback(async () => {
    if (!checkAdminAccess()) return
    try {
      // Mock Data Load (In real app, fetch from API)
      const mockUsers = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i+1}@titan.com`,
        risk_score: Math.random() > 0.8 ? 'HIGH' : 'LOW',
        subdomains: [{ count: Math.floor(Math.random() * 5) }],
        created_at: new Date().toISOString()
      }))
      setUsersList(mockUsers)
      setFilteredUsers(mockUsers)
      setStats(prev => ({ ...prev, users: 1250, subdomains: 4502 }))
      setLoading(false)
    } catch (error) {
      addToast('error', 'Gagal memuat data admin')
      setLoading(false)
    }
  }, [checkAdminAccess, addToast])

  useEffect(() => {
    fetchData()
    // Real-time Simulation
    const interval = setInterval(() => {
        setCurrentTime(new Date())
        setTrafficData(prev => [...prev.slice(1), Math.floor(Math.random() * 80) + 10])
        setStats(prev => ({
            ...prev,
            server_load: Math.floor(Math.random() * 30) + 20,
            memory_usage: Math.floor(Math.random() * 15) + 40
        }))
    }, 1500)
    return () => clearInterval(interval)
  }, [fetchData])

  // --- HANDLERS ---
  
  const handleTerminalCommand = (e) => {
    e.preventDefault()
    if(!terminalInput.trim()) return
    const cmd = terminalInput.trim().toLowerCase()
    
    let response = { type: 'info', text: '' }
    if(cmd === 'clear') { setTerminalOutput([]); setTerminalInput(''); return }
    else if(cmd === 'status') response = { type: 'success', text: 'All systems operational. Load: ' + stats.server_load + '%' }
    else if(cmd === 'users') response = { type: 'info', text: `Total Active Users: ${usersList.length}` }
    else if(cmd === 'help') response = { type: 'warning', text: 'Commands: status, users, clear, reboot, logs' }
    else response = { type: 'error', text: `Command not found: ${cmd}` }

    setTerminalOutput(prev => [...prev, { type: 'cmd', text: `root@titan:~# ${cmd}` }, response])
    setTerminalInput('')
  }

  const toggleFolder = (folderId) => {
    const updateNodes = (nodes) => {
        return nodes.map(node => {
            if (node.id === folderId) return { ...node, isOpen: !node.isOpen }
            if (node.children) return { ...node, children: updateNodes(node.children) }
            return node
        })
    }
    setFileSystem(updateNodes(fileSystem))
  }

  const addTask = () => {
    if(!newTaskText) return
    setTasks([...tasks, { id: Date.now(), title: newTaskText, status: 'todo', priority: 'medium' }])
    setNewTaskText('')
    addToast('success', 'Task added')
  }

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const deletePopup = () => {
    setPopupForm({ ...popupForm, active: false })
    addToast('info', 'Popup deactivated')
  }

  const savePopup = () => {
    setPopupForm({ ...popupForm, active: true })
    addToast('success', 'Global popup published')
  }

  // --- RENDERERS ---

  const renderFileSystem = (nodes) => {
    return nodes.map(node => (
        <div key={node.id} style={{ paddingLeft: `${node.level * 12}px` }}>
            <div 
                className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-white/5 rounded-md text-[10px] transition-colors group ${node.type === 'folder' ? 'text-blue-200' : 'text-slate-400'}`}
                onClick={() => node.type === 'folder' && toggleFolder(node.id)}
            >
                {node.type === 'folder' ? (
                    <>
                        <ChevronRight size={10} className={`transition-transform ${node.isOpen ? 'rotate-90' : ''}`}/>
                        <Folder size={12} className={node.isOpen ? 'fill-blue-500/20 text-blue-400' : 'text-slate-500'}/>
                    </>
                ) : (
                    <>
                        <span className="w-2.5"></span>
                        <FileText size={12} className="text-slate-500"/>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center"><Shield size={24} className="text-red-600"/></div>
        </div>
        <h1 className="text-xs font-bold text-red-600 tracking-[0.5em] mt-6 animate-pulse">TITAN SYSTEM</h1>
      </div>
    )
  }

  const getThemeColors = () => {
    if(themeColor === 'blue') return 'text-blue-500 border-blue-500/20 bg-blue-500/10'
    if(themeColor === 'green') return 'text-green-500 border-green-500/20 bg-green-500/10'
    if(themeColor === 'purple') return 'text-purple-500 border-purple-500/20 bg-purple-500/10'
    return 'text-red-500 border-red-500/20 bg-red-500/10'
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-slate-300 selection:bg-red-900/30 selection:text-white">
      
      {/* Global Modal Container */}
      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        type={modalConfig.type}
        footer={modalConfig.action && (
          <>
             <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold">CANCEL</button>
             <button onClick={() => { modalConfig.action(); setModalConfig({ ...modalConfig, isOpen: false }) }} className={`px-4 py-2 rounded-lg text-[10px] font-bold text-white shadow-lg ${modalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>CONFIRM</button>
          </>
        )}
      >
        {modalConfig.content}
      </Modal>

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            
            {/* Logo & Mobile Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getThemeColors()} shadow-[0_0_15px_rgba(220,38,38,0.2)]`}>
                  <Shield size={18}/>
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-widest uppercase leading-none">Titan<span className={themeColor === 'red' ? 'text-red-600' : themeColor === 'blue' ? 'text-blue-600' : themeColor === 'green' ? 'text-green-600' : 'text-purple-600'}>Core</span></h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[9px] text-slate-500 font-mono font-bold">V{stats.version} • GOD MODE</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-lg border border-white/10"><List size={16}/></button>
            </div>

            {/* Navigation Tabs */}
            <div className={`${showMobileMenu ? 'flex' : 'hidden'} md:flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 items-center justify-start md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0 mt-2 md:mt-0`}>
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'system', icon: Server, label: 'System' },
                { id: 'popup', icon: LayoutTemplate, label: 'Visual Popup' },
                { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
                { id: 'tools', icon: Settings, label: 'Tools' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${activeTab === tab.id ? `${getThemeColors()} shadow-sm` : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={12}/> {tab.label}
                </button>
              ))}
              <div className="h-5 w-px bg-white/10 mx-1 hidden md:block"></div>
              <div className="flex items-center gap-2">
                 {['red', 'blue', 'green', 'purple'].map(color => (
                     <button 
                        key={color} 
                        onClick={() => setThemeColor(color)}
                        className={`w-3 h-3 rounded-full border ${themeColor === color ? 'border-white scale-125' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7' }}
                     ></button>
                 ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 mt-6 space-y-6">

        {/* ======================= TAB: OVERVIEW ======================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {[
                 { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                 { label: 'Subdomains', value: stats.subdomains, icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
                 { label: 'Server Load', value: `${stats.server_load}%`, icon: Cpu, color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/20' },
                 { label: 'Health Score', value: `${stats.health_score}/100`, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/20' }
               ].map((stat, i) => (
                 <div key={i} className={`p-4 rounded-xl border ${stat.bg} ${stat.border} relative overflow-hidden group transition-all hover:-translate-y-1`}>
                    <div className={`absolute -right-3 -top-3 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 scale-150 ${stat.color}`}>
                        <stat.icon size={60}/>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={14} className={stat.color}/>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                        <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                    </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Traffic Matrix */}
                <div className="lg:col-span-2 bg-[#0f1014] rounded-xl border border-white/5 p-1 flex flex-col h-72 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-3 left-4 z-10">
                        <h3 className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><BarChart3 size={12} className="text-blue-500"/> Live Traffic Matrix</h3>
                        <p className="text-[9px] text-slate-500 font-mono">Real-time packet analysis</p>
                    </div>
                    <div className="flex-1 pt-10 bg-gradient-to-b from-blue-900/5 to-transparent relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <TrafficChart data={trafficData} />
                    </div>
                    <div className="h-6 bg-[#0a0b0e] border-t border-white/5 flex items-center justify-between px-3 text-[9px] text-slate-600 font-mono uppercase">
                        <span>-60s</span>
                        <span>HTTP/WS Stream</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Quick Actions & Support */}
                <div className="grid grid-rows-2 gap-4">
                    <div className="bg-[#0f1014] rounded-xl border border-white/5 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><Inbox size={12} className="text-yellow-500"/> Ticket Inbox</h3>
                            <span className="text-[9px] bg-white/10 px-1.5 rounded text-white">{tickets.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {tickets.map(t => (
                                <div key={t.id} className="p-2 bg-white/[0.02] hover:bg-white/5 rounded-lg border border-white/5 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-blue-400">@{t.user}</span>
                                        <span className="text-[8px] text-slate-600">{t.time}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-300 line-clamp-1">{t.subject}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-[#0f1014] rounded-xl border border-white/5 p-4 flex flex-col justify-center gap-2">
                        <button className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group text-left">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Zap size={16}/></div>
                            <div>
                                <h4 className="text-[10px] font-bold text-white">System Optimization</h4>
                                <p className="text-[8px] text-slate-500">Run cleanup & index</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group text-left">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><UploadCloud size={16}/></div>
                            <div>
                                <h4 className="text-[10px] font-bold text-white">Manual Backup</h4>
                                <p className="text-[8px] text-slate-500">Create snapshot</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: USERS ======================= */}
        {activeTab === 'users' && (
            <div className="bg-[#0f1014] rounded-xl border border-white/5 flex flex-col h-[75vh] animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl overflow-hidden">
                {/* User Toolbar */}
                <div className="p-3 border-b border-white/5 bg-[#0a0b0e] flex flex-col lg:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20"><Users size={14}/></div>
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">User Directory</h2>
                            <p className="text-[9px] text-slate-500">{usersList.length} Accounts Registered</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64 group">
                            <Search className="absolute left-2.5 top-2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={12} />
                            <input className="w-full bg-[#16181d] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600" placeholder="Regex Search..."/>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2">
                            <UserPlus size={12}/> New User
                        </button>
                    </div>
                </div>

                {/* User Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#111318] text-slate-500 font-bold uppercase sticky top-0 z-10 border-b border-white/5">
                            <tr>
                                <th className="p-3 pl-4">Identity</th>
                                <th className="p-3">Risk Score</th>
                                <th className="p-3">Subdomains</th>
                                <th className="p-3">Joined</th>
                                <th className="p-3 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-3 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-white text-[10px] border border-white/10 shadow-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{u.name}</div>
                                                <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1"><Mail size={8}/> {u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={u.risk_score} type={u.risk_score === 'HIGH' ? 'danger' : 'active'} />
                                    </td>
                                    <td className="p-3 font-mono text-slate-400">{u.subdomains[0]?.count || 0} Records</td>
                                    <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="p-3 text-right pr-4">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-blue-500/20 rounded-md text-blue-400 transition-colors" title="Inspect"><Eye size={12}/></button>
                                            <button className="p-1.5 hover:bg-yellow-500/20 rounded-md text-yellow-400 transition-colors" title="Reset Key"><Key size={12}/></button>
                                            <button className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors" title="Ban"><Ban size={12}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ======================= TAB: VISUAL POPUP ======================= */}
        {activeTab === 'popup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Editor */}
                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2"><LayoutTemplate size={14} className="text-purple-500"/> Visual Popup Builder</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-500">STATUS:</span>
                             <button onClick={() => setPopupForm({...popupForm, active: !popupForm.active})} className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${popupForm.active ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-slate-500/20 text-slate-500 border-slate-500/30'}`}>
                                 {popupForm.active ? 'LIVE' : 'OFF'}
                             </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Popup Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['text', 'image', 'mixed'].map(t => (
                                    <button key={t} onClick={() => setPopupForm({...popupForm, type: t})} className={`py-2 rounded-lg text-[9px] font-bold border uppercase transition-all ${popupForm.type === t ? 'bg-purple-600 text-white border-purple-500 shadow-md' : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/10'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-500 uppercase">Title</label>
                             <input value={popupForm.title} onChange={e => setPopupForm({...popupForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 transition-colors placeholder-slate-600" placeholder="Important Announcement..."/>
                        </div>

                        <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-500 uppercase">Message</label>
                             <textarea value={popupForm.message} onChange={e => setPopupForm({...popupForm, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 transition-colors resize-none placeholder-slate-600" rows="4" placeholder="Enter your message here..."/>
                        </div>

                        {(popupForm.type === 'image' || popupForm.type === 'mixed') && (
                            <div className="space-y-1 animate-in fade-in">
                                <label className="text-[9px] font-bold text-slate-500 uppercase">Image URL</label>
                                <div className="flex gap-2">
                                    <input value={popupForm.image} onChange={e => setPopupForm({...popupForm, image: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-purple-500 transition-colors placeholder-slate-600" placeholder="https://..."/>
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center w-9"><ImageIcon size={12} className="text-slate-400"/></div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button onClick={deletePopup} className="flex-1 py-2.5 bg-white/5 text-slate-400 rounded-xl text-[10px] font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 border border-white/5">
                                <Trash2 size={12}/> DELETE
                            </button>
                            <button onClick={savePopup} className="flex-1 py-2.5 bg-white text-black rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-white/10 active:scale-95">
                                <Save size={12}/> PUBLISH LIVE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] min-h-[400px] shadow-lg">
                    <div className="absolute top-4 left-4 bg-black/60 px-2 py-0.5 rounded border border-white/10 text-[8px] font-bold text-slate-300 uppercase tracking-wider backdrop-blur-md">Mobile Preview</div>
                    
                    <div className="relative bg-[#1a1b23] border border-white/10 rounded-2xl shadow-2xl w-[280px] overflow-hidden transform transition-all hover:scale-[1.02] ring-4 ring-black/20">
                        <div className="h-6 bg-black flex items-center justify-center gap-1">
                            <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="relative h-[350px] bg-slate-900 overflow-hidden flex items-center justify-center p-4">
                            {/* The Popup Mockup */}
                            <div className="w-full bg-[#25262b] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                                {(popupForm.type === 'image' || popupForm.type === 'mixed') && popupForm.image && (
                                    <div className="w-full h-32 bg-slate-800 relative overflow-hidden">
                                        <img src={popupForm.image} className="w-full h-full object-cover" alt="Preview"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#25262b] to-transparent"></div>
                                    </div>
                                )}
                                <div className={`p-4 ${popupForm.type !== 'text' && popupForm.image ? '-mt-6 relative z-10' : ''} text-center`}>
                                    {popupForm.type === 'text' && (
                                        <div className="mx-auto w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 text-purple-400 border border-purple-500/30"><Bell size={18}/></div>
                                    )}
                                    <h3 className="text-sm font-bold text-white mb-2 leading-tight">{popupForm.title || 'Popup Title'}</h3>
                                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">{popupForm.message || 'Your message description will appear here...'}</p>
                                    <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold text-[10px] shadow-lg">UNDERSTOOD</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ======================= TAB: TASKS (KANBAN) ======================= */}
        {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Task Stats */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                         <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><CheckCircle2 size={16}/></div>
                         <div><h4 className="text-lg font-bold text-white">{tasks.filter(t=>t.status==='done').length}</h4><p className="text-[9px] text-slate-500 uppercase">Completed</p></div>
                     </div>
                     <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                         <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Clock size={16}/></div>
                         <div><h4 className="text-lg font-bold text-white">{tasks.filter(t=>t.status==='in-progress').length}</h4><p className="text-[9px] text-slate-500 uppercase">In Progress</p></div>
                     </div>
                </div>

                {/* Kanban Columns */}
                {['todo', 'in-progress', 'done'].map(status => (
                    <div key={status} className="bg-[#0f1014] rounded-xl border border-white/5 p-4 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status==='todo'?'bg-slate-500':status==='in-progress'?'bg-yellow-500':'bg-green-500'}`}></span>
                                {status.replace('-', ' ')}
                            </h3>
                            <span className="text-[9px] bg-white/10 px-1.5 rounded text-slate-300">{tasks.filter(t=>t.status === status).length}</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {tasks.filter(t => t.status === status).map(t => (
                                <div key={t.id} className="p-3 bg-white/[0.03] border border-white/5 rounded-lg hover:border-white/20 transition-all group">
                                    <p className="text-[10px] text-white font-bold mb-2">{t.title}</p>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${t.priority==='high'?'bg-red-500/10 text-red-500':t.priority==='medium'?'bg-yellow-500/10 text-yellow-500':'bg-blue-500/10 text-blue-500'}`}>{t.priority}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {status !== 'done' && <button onClick={() => moveTask(t.id, status === 'todo' ? 'in-progress' : 'done')} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"><ArrowRight size={10}/></button>}
                                            <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-500"><Trash2 size={10}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {status === 'todo' && (
                                <div className="mt-2 flex gap-2">
                                    <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500" placeholder="New task..."/>
                                    <button onClick={addTask} className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Plus size={14}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ======================= TAB: TOOLS / SYSTEM ======================= */}
        {activeTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* File Explorer */}
                <div className="bg-[#0f1014] rounded-xl border border-white/5 p-4 flex flex-col h-[400px]">
                    <h3 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2 border-b border-white/5 pb-2"><Folder size={14} className="text-yellow-500"/> File System</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                        {renderFileSystem(fileSystem)}
                    </div>
                </div>

                {/* Terminal */}
                <div className="lg:col-span-2 bg-[#0f1014] rounded-xl border border-white/5 flex flex-col h-[400px] overflow-hidden shadow-lg">
                    <div className="bg-[#1a1b21] p-2 flex items-center justify-between border-b border-white/5">
                       <div className="flex items-center gap-2">
                          <TerminalSquare size={12} className="text-slate-400" />
                          <span className="text-[10px] font-mono text-slate-300">root@titan-server:~ (ssh)</span>
                       </div>
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                       </div>
                    </div>
                    <div className="flex-1 bg-[#050505] p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar" onClick={() => document.getElementById('term-input').focus()}>
                        {terminalOutput.map((line, i) => (
                            <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'warning' ? 'text-yellow-400' : line.type === 'info' ? 'text-blue-400' : 'text-slate-300'}`}>
                                {line.type === 'cmd' ? <span className="text-slate-500 mr-2">$</span> : null}
                                {line.text}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleTerminalCommand} className="p-2 bg-[#0a0b0e] border-t border-white/5 flex items-center gap-2">
                        <span className="text-green-500 font-bold text-xs">➜</span>
                        <input id="term-input" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} className="flex-1 bg-transparent text-[10px] text-white outline-none font-mono" autoComplete="off" autoFocus spellCheck="false"/>
                    </form>
                </div>
            </div>
        )}

        {/* ======================= TAB: TOOLS ======================= */}
        {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Tool Cards */}
                {[
                    { title: 'Maintenance Mode', desc: 'Toggle global maintenance screen', icon: Power, color: 'text-red-500', action: () => setModalConfig({ isOpen: true, title: 'Toggle Maintenance', type: 'danger', content: <p className="text-xs text-slate-400">Are you sure you want to toggle maintenance mode? This will affect all users.</p>, action: () => { setStats(p => ({...p, maintenance: !p.maintenance})); addToast('success', 'Maintenance updated') } }) },
                    { title: 'API Key Vault', desc: 'Manage global API keys', icon: Key, color: 'text-yellow-500', action: () => {} },
                    { title: 'Cache Explorer', desc: 'View Redis/Memcached stats', icon: Database, color: 'text-blue-500', action: () => {} },
                    { title: 'Cron Scheduler', desc: 'Manage automated tasks', icon: Clock, color: 'text-green-500', action: () => {} }
                ].map((tool, i) => (
                    <div key={i} onClick={tool.action} className="bg-[#0f1014] p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors ${tool.color}`}>
                            <tool.icon size={20}/>
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase mb-1">{tool.title}</h3>
                        <p className="text-[10px] text-slate-500">{tool.desc}</p>
                    </div>
                ))}
                
                {/* Server Health Heatmap */}
                <div className="lg:col-span-2 bg-[#0f1014] p-5 rounded-xl border border-white/5">
                    <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Cpu size={14}/> CPU Core Heatmap</h3>
                    <div className="grid grid-cols-8 gap-2">
                        {Array.from({length: 16}).map((_, i) => {
                            const load = Math.floor(Math.random() * 100)
                            return (
                                <div key={i} className="aspect-square rounded flex items-center justify-center text-[8px] font-bold text-white transition-all duration-500" 
                                    style={{ backgroundColor: load > 80 ? '#ef4444' : load > 50 ? '#eab308' : '#22c55e', opacity: load/100 + 0.2 }}>
                                    {load}%
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Audit Log Timeline */}
                <div className="lg:col-span-2 bg-[#0f1014] p-5 rounded-xl border border-white/5 h-[200px] overflow-hidden flex flex-col">
                    <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><FileText size={14}/> Audit Log</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative pl-4 border-l border-white/5 space-y-4">
                        {[
                            { action: 'System Reboot', user: 'root', time: '2m ago' },
                            { action: 'User Ban: alex_dev', user: 'admin', time: '15m ago' },
                            { action: 'Config Update', user: 'system', time: '1h ago' }
                        ].map((log, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#0f1014]"></div>
                                <p className="text-[10px] font-bold text-white">{log.action}</p>
                                <p className="text-[9px] text-slate-500">by <span className="text-blue-400">{log.user}</span> • {log.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard
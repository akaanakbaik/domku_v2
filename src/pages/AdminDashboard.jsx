import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { 
  Shield, Users, Globe, Activity, Search, Trash2, Ban, Lock, Server, Zap, Power, 
  Database, Settings, RefreshCw, XCircle, Bell, Plus, Image as ImageIcon, Send, Key, 
  Terminal, Cpu, HardDrive, Wifi, Save, ChevronDown, Check, FileText, LayoutTemplate, 
  Radio, Monitor, Clock, Calendar, CheckCircle2, AlertTriangle, MousePointer2, 
  StickyNote, Eraser, PenTool, UploadCloud, Folder, File, FolderPlus, Sidebar, 
  MoreHorizontal, Download, X, ArrowRight, ArrowUp, ArrowDown, Filter, Layers, 
  CreditCard, PieChart, BarChart3, UserCheck, UserX, Menu, Command, Laptop, 
  Smartphone, Eye, LogOut, Moon, Sun, Grip, List, Archive, Unlock, ChevronRight,
  TerminalSquare, Hash, Network, Siren
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

/**
 * ==================================================================================
 * UTILITY HOOKS & HELPERS
 * ==================================================================================
 */

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

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const generateMockData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    value: Math.floor(Math.random() * 100),
    timestamp: new Date(Date.now() - i * 60000).toISOString()
  })).reverse()
}

/**
 * ==================================================================================
 * CUSTOM UI COMPONENTS (INTERNAL DESIGN SYSTEM)
 * ==================================================================================
 */

// 1. Custom Modal System with Animation and Scroll Lock
const Modal = ({ isOpen, onClose, title, children, footer, type = 'default', size = 'md' }) => {
  const [show, setShow] = useState(isOpen)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShow(true)
      setTimeout(() => setAnimate(true), 10)
      document.body.style.overflow = 'hidden'
    } else {
      setAnimate(false)
      const timer = setTimeout(() => setShow(false), 300)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!show) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw] h-[90vh]'
  }

  const typeStyles = {
    default: { border: 'border-white/10', header: 'bg-white/[0.02] border-white/5', title: 'text-white' },
    danger: { border: 'border-red-500/30', header: 'bg-red-500/10 border-red-500/20', title: 'text-red-500' },
    success: { border: 'border-green-500/30', header: 'bg-green-500/10 border-green-500/20', title: 'text-green-500' }
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${animate ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}`}>
      <div 
        className={`w-full ${sizeClasses[size]} bg-[#0a0b0e] border rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 transform ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'} ${typeStyles[type].border}`}
      >
        <div className={`px-4 py-3 border-b flex justify-between items-center rounded-t-xl ${typeStyles[type].header}`}>
          <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2 ${typeStyles[type].title}`}>
            {type === 'danger' && <AlertTriangle size={12} />}
            {type === 'success' && <CheckCircle2 size={12} />}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="p-0 overflow-y-auto custom-scrollbar relative flex-1">
          {children}
        </div>
        
        {footer && (
          <div className="px-4 py-3 border-t border-white/5 bg-[#08090b] rounded-b-xl flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// 2. Custom Select Dropdown (Non-native for styling)
const CustomSelect = ({ options, value, onChange, icon: Icon, placeholder = "Select...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setIsOpen(false))

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#111318] border ${isOpen ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/10 hover:border-white/20'} rounded-lg px-3 py-2 text-[10px] text-white transition-all outline-none shadow-sm h-[36px]`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={12} className={`shrink-0 ${isOpen ? 'text-blue-400' : 'text-slate-500'}`} />}
          <span className={`truncate ${selectedOption ? 'text-slate-200' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={12} className={`text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#16181d] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-48 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] flex items-center gap-2 transition-colors ${value === opt.value ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {opt.icon && <opt.icon size={12} className="shrink-0" />}
                <span className="truncate flex-1">{opt.label}</span>
                {value === opt.value && <Check size={10} className="text-blue-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 3. Custom Toggle Switch
const CustomToggle = ({ checked, onChange, label, subLabel }) => (
    <div className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-white/[0.02] transition-colors" onClick={() => onChange(!checked)}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
          {subLabel && <span className="text-[9px] text-slate-600">{subLabel}</span>}
        </div>
        <div className={`w-9 h-5 rounded-full relative transition-all duration-300 ${checked ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-800 border border-white/5'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${checked ? 'left-5' : 'left-1'}`}></div>
        </div>
    </div>
)

// 4. Traffic Bar Chart (CSS-based for performance)
const TrafficChart = ({ data, color = 'blue' }) => {
  const max = Math.max(...data, 1)
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="flex items-end gap-[2px] h-full w-full px-1 pb-1">
      {data.map((value, i) => {
        const height = (value / max) * 100
        const isHigh = height > 90
        return (
          <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
            <div 
              className={`w-full rounded-t-[1px] transition-all duration-500 ease-in-out relative ${isHigh ? 'bg-white opacity-80' : `${colors[color]} opacity-40 group-hover:opacity-80`}`} 
              style={{ height: `${height}%` }}
            >
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 5. Stat Card Widget
const StatCard = ({ label, value, icon: Icon, color, trend, trendValue, onClick }) => (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border bg-[#0f1014] relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-default ${
        color === 'blue' ? 'border-blue-500/10 hover:border-blue-500/30' :
        color === 'red' ? 'border-red-500/10 hover:border-red-500/30' :
        color === 'green' ? 'border-green-500/10 hover:border-green-500/30' :
        'border-purple-500/10 hover:border-purple-500/30'
    }`}>
        <div className={`absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform rotate-12 scale-150 ${
            color === 'blue' ? 'text-blue-500' : color === 'red' ? 'text-red-500' : color === 'green' ? 'text-green-500' : 'text-purple-500'
        }`}>
            <Icon size={100}/>
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div className={`p-2 rounded-lg ${
                 color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                 color === 'red' ? 'bg-red-500/10 text-red-500' :
                 color === 'green' ? 'bg-green-500/10 text-green-500' :
                 'bg-purple-500/10 text-purple-500'
            }`}>
                <Icon size={16}/>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    trend === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                    {trend === 'up' ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                    {trendValue}
                </div>
            )}
        </div>

        <div className="relative z-10 mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    </div>
)

// 6. Interactive Terminal Component
const TerminalBlock = ({ output, input, setInput, onEnter }) => {
    const endRef = useRef(null)
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [output])
    
    return (
        <div className="flex flex-col h-full bg-[#050505] font-mono text-[10px] rounded-lg overflow-hidden border border-white/5 shadow-inner">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                {output.map((line, i) => (
                    <div key={i} className="break-all">
                        {line.type === 'cmd' && (
                            <div className="flex gap-2 text-slate-400">
                                <span className="text-blue-500 font-bold">root@titan:~#</span>
                                <span>{line.text}</span>
                            </div>
                        )}
                        {line.type === 'success' && <div className="text-green-400 pl-4">➜ {line.text}</div>}
                        {line.type === 'error' && <div className="text-red-400 pl-4">✖ {line.text}</div>}
                        {line.type === 'info' && <div className="text-blue-300 pl-4">ℹ {line.text}</div>}
                        {line.type === 'warn' && <div className="text-yellow-400 pl-4">⚠ {line.text}</div>}
                        {line.type === 'raw' && <div className="text-slate-300 pl-4 whitespace-pre-wrap opacity-80">{line.text}</div>}
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onEnter(); }} className="p-2 bg-[#0a0b0e] border-t border-white/5 flex items-center gap-2">
                <span className="text-blue-500 font-bold animate-pulse">➜</span>
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-700"
                    placeholder="Type help for commands..."
                    autoComplete="off"
                    spellCheck="false"
                />
            </form>
        </div>
    )
}

/**
 * ==================================================================================
 * MAIN COMPONENT: ADMIN DASHBOARD
 * ==================================================================================
 */

const AdminDashboard = () => {
  const outletContext = useOutletContext()
  const authContext = useAuth()
  const user = outletContext?.user || authContext?.user
  const { impersonate } = authContext
  const navigate = useNavigate()
  const { addToast } = useToast()

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Data States
  const [stats, setStats] = useState({
    users: 0, 
    subdomains: 0, 
    active_sessions: 0,
    server_health: 100,
    cpu_usage: 0,
    ram_usage: 0,
    disk_usage: 0,
    network_in: 0,
    network_out: 0,
    version: '2.4.0-stable'
  })
  
  const [trafficData, setTrafficData] = useState(Array(40).fill(10))
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  
  // Feature States
  const [popupConfig, setPopupConfig] = useState({ 
    active: false, type: 'TEXT', title: '', message: '', 
    image: '', duration: 'PERMANENT', btnText: 'Okay' 
  })
  
  const [fileSystem, setFileSystem] = useState([
    { id: 'root', name: 'root', type: 'dir', open: true, children: [
      { id: 'logs', name: 'logs', type: 'dir', open: false, children: [
         { id: 'access', name: 'access.log', type: 'file', size: '24MB' },
         { id: 'error', name: 'error.log', type: 'file', size: '2MB' }
      ]},
      { id: 'config', name: 'config', type: 'dir', open: true, children: [
         { id: 'app', name: 'app.json', type: 'file', size: '4KB' },
         { id: 'db', name: 'database.yml', type: 'file', size: '1KB' }
      ]},
      { id: 'uploads', name: 'uploads', type: 'dir', open: false, children: [] }
    ]}
  ])

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Security Logs', done: false, priority: 'high' },
    { id: 2, text: 'Clear Redis Cache', done: true, priority: 'low' }
  ])
  const [newTask, setNewTask] = useState('')

  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'info', text: 'Titan Kernel v2.4.0 initialized.' },
    { type: 'success', text: 'Connected to primary shard.' }
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [modal, setModal] = useState({ type: null, data: null })
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // --- REFS & HELPERS ---
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', 'X-Admin-Token': user?.token || 'mock-token' }), [user])

  // --- EFFECTS ---

  // 1. Initial Data Load (Mock + API Fallback)
  useEffect(() => {
    // Simulasi loading data yang berat untuk kesan profesional
    const init = async () => {
      if (user?.email !== 'khaliqarrasyidabdul@gmail.com') {
         // Security check (Client side only, backend should enforce too)
         // navigate('/', { replace: true }) 
         // Commented out for demo purposes so it works for "user"
      }

      try {
        // Simulasi fetch delay
        await new Promise(r => setTimeout(r, 1200))
        
        // Mock Data Injection
        const mockUsers = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i+1}@example.com`,
          role: i === 0 ? 'ADMIN' : 'USER',
          status: Math.random() > 0.1 ? 'ACTIVE' : 'BANNED',
          risk: Math.random() > 0.8 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
          joined: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          subdomains: Math.floor(Math.random() * 5)
        }))
        
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
        setStats(prev => ({
          ...prev,
          users: 1240,
          subdomains: 3402,
          active_sessions: 89,
          cpu_usage: 34,
          ram_usage: 62
        }))
        
      } catch (e) {
        addToast('error', 'Initialization Failed')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [user, navigate, addToast])

  // 2. Real-time Simulation (Clock & Traffic)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Update Traffic
      setTrafficData(prev => {
        const newData = [...prev.slice(1), Math.floor(Math.random() * 80) + 10]
        return newData
      })

      // Fluctuate Server Stats
      setStats(prev => ({
        ...prev,
        cpu_usage: Math.min(100, Math.max(0, prev.cpu_usage + (Math.random() * 10 - 5))).toFixed(1),
        ram_usage: Math.min(100, Math.max(0, prev.ram_usage + (Math.random() * 6 - 3))).toFixed(1),
        network_in: (Math.random() * 50).toFixed(1),
        network_out: (Math.random() * 120).toFixed(1)
      }))

    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 3. User Filtering Logic
  useEffect(() => {
    let res = users.filter(u => 
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    )
    if (userFilter === 'ACTIVE') res = res.filter(u => u.status === 'ACTIVE')
    if (userFilter === 'BANNED') res = res.filter(u => u.status === 'BANNED')
    if (userFilter === 'HIGH_RISK') res = res.filter(u => u.risk === 'HIGH')
    
    setFilteredUsers(res)
  }, [userSearch, userFilter, users])

  // --- ACTIONS ---

  const handleTerminalSubmit = () => {
    const cmd = terminalInput.trim().toLowerCase()
    if (!cmd) return
    
    const newOutput = [...terminalOutput, { type: 'cmd', text: cmd }]
    
    setTimeout(() => {
      switch(cmd) {
        case 'help':
          setTerminalOutput(prev => [...prev, { type: 'raw', text: `
 AVAILABLE COMMANDS:
 -------------------
 > status      Show server status
 > users       List recent users
 > clear       Clear terminal
 > purge       Purge CDN cache
 > reboot      Reboot instance (Simulated)
          ` }])
          break
        case 'clear':
          setTerminalOutput([])
          break
        case 'status':
          setTerminalOutput(prev => [...prev, { type: 'info', text: `CPU: ${stats.cpu_usage}% | RAM: ${stats.ram_usage}% | UPTIME: 14d 2h 12m` }])
          break
        case 'users':
          setTerminalOutput(prev => [...prev, { type: 'success', text: `Fetching... Found ${users.length} records.` }])
          break
        case 'reboot':
          setTerminalOutput(prev => [...prev, { type: 'warn', text: 'Initiating restart sequence...' }])
          setTimeout(() => setTerminalOutput(prev => [...prev, { type: 'error', text: 'Error: Permission denied (Safety Mode Active)' }]), 1000)
          break
        default:
          setTerminalOutput(prev => [...prev, { type: 'error', text: `Command not found: ${cmd}` }])
      }
    }, 200)
    
    setTerminalOutput(newOutput)
    setTerminalInput('')
  }

  const toggleFileSystem = (id) => {
    const toggle = (nodes) => nodes.map(node => {
      if (node.id === id) return { ...node, open: !node.open }
      if (node.children) return { ...node, children: toggle(node.children) }
      return node
    })
    setFileSystem(toggle(fileSystem))
  }

  const handleBanUser = (targetUser) => {
    setModal({
      type: 'BAN_CONFIRM',
      data: targetUser
    })
  }

  const confirmBan = () => {
    setUsers(users.map(u => u.id === modal.data.id ? { ...u, status: 'BANNED', risk: 'HIGH' } : u))
    addToast('success', `User ${modal.data.email} has been banned.`)
    setModal({ type: null, data: null })
  }

  // --- RENDERERS ---

  const renderFileSystem = (nodes, level = 0) => (
    nodes.map(node => (
      <div key={node.id} style={{ paddingLeft: level * 12 }} className="select-none">
        <div 
          onClick={() => node.type === 'dir' && toggleFileSystem(node.id)}
          className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors ${node.type === 'dir' ? 'text-blue-200 hover:bg-blue-500/10' : 'text-slate-400 hover:bg-white/5'}`}
        >
          {node.type === 'dir' ? (
            <>
              <ChevronRight size={10} className={`transition-transform ${node.open ? 'rotate-90' : ''}`} />
              <Folder size={12} className={node.open ? 'fill-blue-500/20 text-blue-400' : 'text-slate-500'} />
            </>
          ) : (
            <>
              <span className="w-2.5"></span>
              <FileText size={12} />
            </>
          )}
          <span className="text-[10px] truncate flex-1 font-mono">{node.name}</span>
          {node.type === 'file' && <span className="text-[8px] text-slate-600">{node.size}</span>}
        </div>
        {node.type === 'dir' && node.open && node.children && (
          <div className="border-l border-white/5 ml-[11px] mt-0.5">
            {renderFileSystem(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  )

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin"></div>
          <div className="flex flex-col items-center animate-pulse">
            <h1 className="text-xl font-black text-white tracking-[0.3em] uppercase">Titan<span className="text-red-600">Kernel</span></h1>
            <p className="text-[10px] text-slate-500 font-mono mt-2">INITIALIZING SECURE ENVIRONMENT...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-red-500/30 selection:text-white pb-24">
      
      {/* GLOBAL MODALS */}
      <Modal 
        isOpen={modal.type === 'BAN_CONFIRM'} 
        onClose={() => setModal({ type: null, data: null })}
        title="CONFIRM TERMINATION"
        type="danger"
        footer={
          <>
            <button onClick={() => setModal({ type: null, data: null })} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors">CANCEL</button>
            <button onClick={confirmBan} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20 flex items-center gap-2"><Trash2 size={12}/> EXECUTE BAN</button>
          </>
        }
      >
        <div className="p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3 border border-red-500/20">
            <UserX size={24} className="text-red-500" />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            You are about to ban <strong className="text-white bg-white/10 px-1 rounded">{modal.data?.email}</strong>. 
            This action will immediately revoke their access and flag all associated subdomains.
          </p>
        </div>
      </Modal>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all">
                <Shield size={16} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xs font-black text-white tracking-widest uppercase leading-none">Titan<span className="text-red-600">Admin</span></h1>
                <p className="text-[8px] text-slate-500 font-mono font-bold mt-0.5">GOD MODE ENABLED</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center ml-6 gap-1">
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'system', icon: Server, label: 'System' },
                { id: 'config', icon: Settings, label: 'Config' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#0a0b0e] border border-white/5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-mono text-slate-400">{currentTime.toLocaleTimeString()} UTC</span>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]"></span>
            </button>
            <button className="md:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={16} />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0b0e] p-2 grid grid-cols-4 gap-2 animate-in slide-in-from-top-2">
             {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'system', icon: Server, label: 'System' },
                { id: 'config', icon: Settings, label: 'Config' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400'}`}
                >
                  <tab.icon size={14} className="mb-1" /> {tab.label}
                </button>
              ))}
          </div>
        )}
      </header>

      {/* CONTENT AREA */}
      <main className="max-w-[1920px] mx-auto p-4 space-y-6 animate-in fade-in duration-500">
        
        {/* === TAB: OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard 
                label="Total Users" 
                value={stats.users.toLocaleString()} 
                icon={Users} 
                color="blue" 
                trend="up" 
                trendValue="+12.5%" 
                onClick={() => setActiveTab('users')}
              />
              <StatCard 
                label="Active Sessions" 
                value={stats.active_sessions} 
                icon={Zap} 
                color="green" 
                trend="up" 
                trendValue="Stable" 
              />
              <StatCard 
                label="Risk Threats" 
                value="3" 
                icon={AlertTriangle} 
                color="red" 
                trend="down" 
                trendValue="Low" 
              />
              <StatCard 
                label="Avg Latency" 
                value="24ms" 
                icon={Network} 
                color="purple" 
                trend="up" 
                trendValue="Optimal" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-[#0a0b0e] border border-white/5 rounded-xl p-1 flex flex-col h-[300px] shadow-lg relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                   <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                     <Activity size={12} className="text-blue-500" /> Network Traffic
                   </h3>
                   <p className="text-[9px] text-slate-500 font-mono mt-0.5">Real-time Inbound/Outbound Packets</p>
                </div>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 rounded">IN: {stats.network_in} MB/s</span>
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded">OUT: {stats.network_out} MB/s</span>
                </div>
                <div className="flex-1 mt-10 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
                   <TrafficChart data={trafficData} color="blue" />
                </div>
                <div className="h-6 bg-[#050505] border-t border-white/5 flex items-center justify-between px-3 text-[8px] text-slate-600 font-mono uppercase">
                  <span>-60 Seconds</span>
                  <span>LIVE FEED</span>
                </div>
              </div>

              {/* Server Health */}
              <div className="bg-[#0a0b0e] border border-white/5 rounded-xl p-5 flex flex-col h-[300px] shadow-lg">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-4">
                   <Cpu size={12} className="text-green-500" /> Hardware Monitor
                </h3>
                
                <div className="space-y-6 flex-1">
                   {[
                     { label: 'CPU Usage', value: stats.cpu_usage, color: 'bg-red-500' },
                     { label: 'RAM Usage', value: stats.ram_usage, color: 'bg-blue-500' },
                     { label: 'SSD Storage', value: 45, color: 'bg-yellow-500' }
                   ].map((item, i) => (
                     <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                         <span>{item.label}</span>
                         <span className="text-white">{item.value}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                           style={{ width: `${item.value}%` }}
                         ></div>
                       </div>
                     </div>
                   ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stats.server_health > 80 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-300">SYSTEM STATUS: <span className="text-white">OPERATIONAL</span></span>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions & Recent Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#0a0b0e] border border-white/5 rounded-xl p-4 h-64 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] font-bold text-white uppercase flex items-center gap-2"><List size={12} /> Admin Tasks</h3>
                    <button onClick={() => setNewTask(newTask ? '' : '')} className="p-1 hover:bg-white/10 rounded"><Plus size={12} className="text-slate-400"/></button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input 
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newTask) {
                          setTasks([...tasks, { id: Date.now(), text: newTask, done: false, priority: 'medium' }])
                          setNewTask('')
                        }
                      }}
                      className="flex-1 bg-[#111318] border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                      placeholder="Add new task..."
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                     {tasks.map(t => (
                       <div key={t.id} className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-colors">
                          <div 
                            onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                            className={`w-3 h-3 rounded border cursor-pointer flex items-center justify-center transition-colors ${t.done ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}
                          >
                             {t.done && <Check size={8} className="text-black" />}
                          </div>
                          <span className={`text-[10px] flex-1 ${t.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{t.text}</span>
                          <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-opacity"><Trash2 size={10}/></button>
                       </div>
                     ))}
                     {tasks.length === 0 && <p className="text-center text-[9px] text-slate-600 mt-4">No pending tasks.</p>}
                  </div>
               </div>

               <div className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-white/5 rounded-xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  <div className="relative z-10 max-w-xs">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/10 text-white">
                        <UploadCloud size={20} />
                     </div>
                     <h3 className="text-sm font-bold text-white mb-1">System Backup</h3>
                     <p className="text-[10px] text-slate-400 mb-4">Last backup was 12 hours ago. Total size 4.2GB.</p>
                     <button className="px-4 py-2 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors shadow-lg active:scale-95">
                        TRIGGER MANUAL BACKUP
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* === TAB: USERS === */}
        {activeTab === 'users' && (
           <div className="flex flex-col h-[75vh] bg-[#0a0b0e] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
             <div className="p-3 border-b border-white/5 bg-[#08090b] flex flex-col lg:flex-row gap-3 justify-between items-center">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                   <div className="p-1.5 bg-blue-500/10 rounded text-blue-500 border border-blue-500/20"><Users size={14}/></div>
                   <div>
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">User Directory</h2>
                      <p className="text-[9px] text-slate-500 font-mono">{users.length} Total • {filteredUsers.length} Shown</p>
                   </div>
                </div>
                
                <div className="flex gap-2 w-full lg:w-auto">
                   <div className="relative flex-1 lg:w-64">
                      <Search className="absolute left-2.5 top-2 text-slate-600" size={12} />
                      <input 
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full bg-[#111318] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-white focus:border-blue-500 outline-none transition-colors placeholder-slate-600" 
                        placeholder="Search users via regex..." 
                      />
                   </div>
                   <CustomSelect 
                      options={[
                        { value: 'ALL', label: 'All Users' },
                        { value: 'ACTIVE', label: 'Active Only' },
                        { value: 'BANNED', label: 'Banned' },
                        { value: 'HIGH_RISK', label: 'High Risk' }
                      ]}
                      value={userFilter}
                      onChange={setUserFilter}
                      icon={Filter}
                   />
                </div>
             </div>
             
             <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-[10px]">
                   <thead className="bg-[#111318] text-slate-500 font-bold uppercase sticky top-0 z-10 border-b border-white/5">
                      <tr>
                         <th className="p-3 pl-4">Identity</th>
                         <th className="p-3">Status</th>
                         <th className="p-3">Risk Level</th>
                         <th className="p-3">Subdomains</th>
                         <th className="p-3">Joined</th>
                         <th className="p-3 text-right pr-4">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-slate-300">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] group transition-colors">
                           <td className="p-3 pl-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] border border-white/10 ${u.role === 'ADMIN' ? 'bg-red-900/50 text-red-200' : 'bg-slate-800'}`}>
                                    {u.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-bold text-white flex items-center gap-1">
                                      {u.name}
                                      {u.role === 'ADMIN' && <Shield size={8} className="text-red-500" />}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-mono">{u.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                 {u.status}
                              </span>
                           </td>
                           <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                 <div className={`w-1.5 h-1.5 rounded-full ${u.risk === 'HIGH' ? 'bg-red-500' : u.risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                 <span>{u.risk}</span>
                              </div>
                           </td>
                           <td className="p-3 font-mono text-slate-400">
                              {u.subdomains} Active
                           </td>
                           <td className="p-3 text-slate-500">
                              {new Date(u.joined).toLocaleDateString()}
                           </td>
                           <td className="p-3 text-right pr-4">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => impersonate(u.id)} className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition-colors" title="Login As"><UserCheck size={12}/></button>
                                 <button onClick={() => handleBanUser(u)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Ban"><Ban size={12}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">No users found matching query.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           </div>
        )}

        {/* === TAB: SYSTEM === */}
        {activeTab === 'system' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[75vh]">
              {/* File Explorer */}
              <div className="bg-[#0a0b0e] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-lg">
                 <div className="p-2 border-b border-white/5 bg-[#08090b] flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-2">System Files</span>
                    <div className="flex gap-1">
                       <button className="p-1 hover:bg-white/10 rounded"><FolderPlus size={12} className="text-slate-400"/></button>
                       <button className="p-1 hover:bg-white/10 rounded"><RefreshCw size={12} className="text-slate-400"/></button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {renderFileSystem(fileSystem)}
                 </div>
                 <div className="p-2 border-t border-white/5 bg-[#08090b]">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[65%]"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
                       <span>65% USED</span>
                       <span>120GB FREE</span>
                    </div>
                 </div>
              </div>

              {/* Terminal */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                 <div className="flex-1 bg-[#050505] rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col">
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
                    <div className="flex-1 relative">
                       <TerminalBlock 
                          output={terminalOutput} 
                          input={terminalInput} 
                          setInput={setTerminalInput} 
                          onEnter={handleTerminalSubmit} 
                       />
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* === TAB: CONFIG / TOOLS === */}
        {activeTab === 'config' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
              
              {/* POPUP MANAGER */}
              <div className="bg-[#0a0b0e] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col">
                 <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                    <div>
                       <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                          <LayoutTemplate size={14} className="text-purple-500"/> Broadcast Popup
                       </h3>
                       <p className="text-[9px] text-slate-500 mt-1">Configure global announcement modal for all users.</p>
                    </div>
                    <CustomToggle 
                       checked={popupConfig.active}
                       onChange={val => setPopupConfig({ ...popupConfig, active: val })}
                       label={popupConfig.active ? "ACTIVE" : "INACTIVE"}
                    />
                 </div>
                 
                 <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Popup Type</label>
                          <div className="flex bg-[#111318] p-1 rounded-lg border border-white/10">
                             {['TEXT', 'IMAGE', 'MIXED'].map(t => (
                                <button 
                                  key={t}
                                  onClick={() => setPopupConfig({ ...popupConfig, type: t })}
                                  className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-colors ${popupConfig.type === t ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}
                                >
                                  {t}
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Duration</label>
                          <CustomSelect 
                             options={[{ value: '1H', label: '1 Hour' }, { value: '1D', label: '1 Day' }, { value: 'PERMANENT', label: 'Permanent' }]}
                             value={popupConfig.duration}
                             onChange={val => setPopupConfig({ ...popupConfig, duration: val })}
                             icon={Clock}
                          />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-500 uppercase">Title</label>
                       <input 
                          value={popupConfig.title}
                          onChange={e => setPopupConfig({...popupConfig, title: e.target.value})}
                          className="w-full bg-[#111318] border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white focus:border-purple-500 outline-none"
                          placeholder="Ex: System Maintenance"
                       />
                    </div>
                    
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-500 uppercase">Message Body</label>
                       <textarea 
                          value={popupConfig.message}
                          onChange={e => setPopupConfig({...popupConfig, message: e.target.value})}
                          className="w-full bg-[#111318] border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white focus:border-purple-500 outline-none h-20 resize-none"
                          placeholder="Enter your announcement..."
                       />
                    </div>

                    {(popupConfig.type === 'IMAGE' || popupConfig.type === 'MIXED') && (
                       <div className="space-y-1 animate-in fade-in">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Image URL</label>
                          <div className="flex gap-2">
                             <input 
                                value={popupConfig.image}
                                onChange={e => setPopupConfig({...popupConfig, image: e.target.value})}
                                className="flex-1 bg-[#111318] border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white focus:border-purple-500 outline-none"
                                placeholder="https://..."
                             />
                             <div className="w-10 flex items-center justify-center bg-white/5 rounded border border-white/10">
                                <ImageIcon size={14} className="text-slate-400" />
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="mt-5 pt-4 border-t border-white/5">
                    <button className="w-full py-2 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors shadow-lg active:scale-[0.98] flex justify-center items-center gap-2">
                       <Save size={12} /> SAVE CONFIGURATION
                    </button>
                 </div>
              </div>

              {/* TOOLS GRID */}
              <div className="flex flex-col gap-4">
                 
                 {/* Maintenance Mode */}
                 <div className={`p-5 rounded-xl border transition-all duration-300 ${maintenanceMode ? 'bg-red-500/5 border-red-500/30' : 'bg-[#0a0b0e] border-white/5'}`}>
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className={`text-xs font-bold uppercase flex items-center gap-2 ${maintenanceMode ? 'text-red-500' : 'text-white'}`}>
                             <Siren size={14} /> Maintenance Mode
                          </h3>
                          <p className="text-[9px] text-slate-500 mt-1 max-w-[250px]">
                             When active, only admins can access the dashboard. All public facing routes will show a "Under Construction" page.
                          </p>
                       </div>
                       <CustomToggle 
                          checked={maintenanceMode} 
                          onChange={setMaintenanceMode} 
                          label={maintenanceMode ? "ENABLED" : "DISABLED"} 
                       />
                    </div>
                 </div>

                 {/* Cache Control */}
                 <div className="bg-[#0a0b0e] border border-white/5 rounded-xl p-5 flex-1">
                     <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-4">
                        <Database size={14} className="text-blue-500" /> Cache Control
                     </h3>
                     <div className="space-y-2">
                        {[
                           { name: 'Redis Cache', size: '24 MB' },
                           { name: 'CDN Assets', size: '1.2 GB' },
                           { name: 'API Response Buffer', size: '128 KB' }
                        ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-2 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                 <span className="text-[10px] font-bold text-slate-300">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-[9px] text-slate-500 font-mono">{item.size}</span>
                                 <button className="p-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded text-slate-400 transition-colors">
                                    <Eraser size={12} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button className="w-full mt-4 py-2 border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-white/30 rounded-lg text-[10px] uppercase font-bold transition-all">
                        Flush All Caches
                     </button>
                 </div>
              </div>

           </div>
        )}

      </main>
    </div>
  )
}

export default AdminDashboard
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Shield, Users, Globe, Activity, Search, AlertTriangle, Trash2, Ban, Lock, Server, BarChart3, CheckCircle2, Zap, Power, Database, Settings, RefreshCw, XCircle, Bell, Plus, Image as ImageIcon, Send, Key, Eye, Terminal, Cpu, HardDrive, Wifi, AlertOctagon, X, Save, Layers, Fingerprint, ChevronDown, Download, FileText, List, Sliders, Calendar, UploadCloud, Check, MessageSquare, Clock, Map, Hash, TerminalSquare, StickyNote, LifeBuoy, ToggleLeft, ToggleRight, MoreHorizontal, UserCheck, ShieldAlert, Monitor, Folder, File, Command, Box, Play, RotateCcw, PenTool, LayoutTemplate, Mail, UserPlus, CreditCard, PieChart, TrendingUp, Anchor, Archive, ArrowDown, ArrowUp, Briefcase, Cast, Cloud, Code, Coffee, Columns, Disc, DollarSign, Droplet, ExternalLink, FastForward, Flag, FolderPlus, Framer, Gift, GitBranch, GitCommit, GitMerge, GitPullRequest, Headphones, Heart, Hexagon, Inbox, Info, Instagram, Layout, Link, Linkedin, Loader, MapPin, Maximize, Menu, Mic, Minimize, Minus, Moon, MousePointer, Move, Music, Navigation, Octagon, Package, Pause, Percent, Phone, PlayCircle, Pocket, Printer, Radio, Repeat, Rewind, RSS, Scissors, Share, Share2, Sidebar, Slash, Speaker, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag, Target, Thermometer, ThumbsDown, ThumbsUp, Tool, Truck, Tv, Twitter, Type, Umbrella, Underline, Unlock, Upload, UserMinus, UserX, Video, Voicemail, Volume, Volume1, Volume2, VolumeX, Watch, Youtube, ZoomIn, ZoomOut, Codesandbox, Figma, Github, Gitlab, Trello } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const AdminDashboard = () => {
  const { user } = useOutletContext()
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const [stats, setStats] = useState({
    users: 0,
    subdomains: 0,
    logs: 0,
    banned: 0,
    maintenance: false,
    server_load: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_status: 'Online',
    db_status: 'Connected',
    uptime: '0d 0h 0m',
    requests_per_sec: 0,
    active_connections: 0,
    cache_hit_rate: 0,
    error_rate: 0,
    threat_level: 'LOW'
  })

  const [trafficHistory, setTrafficHistory] = useState(new Array(60).fill(10))
  const [memoryHistory, setMemoryHistory] = useState(new Array(60).fill(30))
  
  const [usersList, setUsersList] = useState([])
  const [notifications, setNotifications] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [logs, setLogs] = useState([])
  const [botReports, setBotReports] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  const [popupConfig, setPopupConfig] = useState({ 
    active: false, 
    title: '', 
    message: '', 
    image: '',
    animation: 'fade',
    timeout: 5000
  })
  
  const [notifForm, setNotifForm] = useState({ 
    title: '', 
    message: '', 
    type: 'INFO', 
    image_url: '',
    target: 'ALL'
  })
  
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', content: 'Initializing DOMKU KERNEL v8.0...' },
    { type: 'info', content: 'Loading modules: [auth, db, net, sec, ai]...' },
    { type: 'success', content: 'Modules loaded successfully.' },
    { type: 'warning', content: 'Security protocols active. Monitoring enabled.' },
    { type: 'system', content: 'Welcome back, Administrator.' }
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const terminalEndRef = useRef(null)

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
                { id: 'index', name: 'index.html', type: 'file', size: '2KB', content: '<html>...</html>' },
                { id: 'robots', name: 'robots.txt', type: 'file', size: '1KB', content: 'User-agent: *' }
              ] 
            },
            { 
              id: 'logs',
              name: 'log', 
              type: 'folder', 
              isOpen: false,
              children: [
                { id: 'syslog', name: 'syslog', type: 'file', size: '14MB', content: 'System initialized...' }, 
                { id: 'authlog', name: 'auth.log', type: 'file', size: '2MB', content: 'Auth success...' }
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
  
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null, isDanger: false })
  const [apiKeyModal, setApiKeyModal] = useState(null)
  
  const headers = { 
    'Content-Type': 'application/json',
    'X-Admin-Email': user?.email 
  }

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

      if (dStats.success) {
        setStats(prev => ({ 
            ...prev, 
            ...dStats.stats,
            request_per_sec: Math.floor(Math.random() * 100),
            active_connections: Math.floor(Math.random() * 500)
        }))
        setLogs(dStats.logs)
      }
      if (dUsers.success) setUsersList(dUsers.users)
      if (dNotif.success) {
          setNotifications(dNotif.data)
          setBotReports(dNotif.data.filter(n => n.title.includes('Laporan')))
      }
      if (dBlack.success) setBlacklist(dBlack.data)

    } catch (error) {
      addToast('error', 'Synchronization failed')
    } finally {
      setLoading(false)
    }
  }, [checkAdminAccess])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
        setCurrentTime(new Date())
        
        setStats(prev => {
            const newLoad = Math.floor(Math.random() * 30) + 10
            const newMem = Math.floor(Math.random() * 20) + 30
            return {
                ...prev,
                server_load: newLoad,
                memory_usage: newMem,
                requests_per_sec: Math.floor(Math.random() * 100) + 50,
                active_connections: prev.active_connections + Math.floor(Math.random() * 10) - 5
            }
        })

        setTrafficHistory(prev => {
            const newValue = Math.floor(Math.random() * 80) + 10
            return [...prev.slice(1), newValue]
        })

        setMemoryHistory(prev => {
            const newValue = Math.floor(Math.random() * 40) + 20
            return [...prev.slice(1), newValue]
        })

    }, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalOutput])

  const calculateStatistics = useMemo(() => {
      const totalRisk = usersList.reduce((acc, user) => acc + (user.risk_score === 'HIGH' ? 3 : user.risk_score === 'MEDIUM' ? 1 : 0), 0)
      const avgSubdomains = usersList.length > 0 ? (stats.subdomains / usersList.length).toFixed(1) : 0
      return { totalRisk, avgSubdomains }
  }, [usersList, stats.subdomains])

  const handleTerminalSubmit = (e) => {
      e.preventDefault()
      if(!terminalInput.trim()) return
      
      const cmd = terminalInput.trim().toLowerCase()
      const newOutput = [...terminalOutput, { type: 'command', content: `root@domku:~# ${cmd}` }]
      
      const commands = {
          'help': { type: 'info', content: 'COMMANDS: status, users, scan, ban [email], clear, reboot, logs, netstat' },
          'status': { type: 'success', content: `SYSTEM: ONLINE | LOAD: ${stats.server_load}% | MEM: ${stats.memory_usage}% | NET: ${stats.network_status}` },
          'users': { type: 'info', content: `REGISTERED: ${usersList.length} | BANNED: ${stats.banned}` },
          'clear': 'CLEAR',
          'scan': { type: 'warning', content: 'Scanning for vulnerabilities... [====================] 100% - No threats found.' },
          'reboot': { type: 'error', content: 'CRITICAL: Reboot requires physical authentication.' },
          'netstat': { type: 'info', content: `Active Connections: ${stats.active_connections} | Port 443: OPEN | Port 80: OPEN` },
          'whoami': { type: 'system', content: 'root (uid=0)' }
      }

      if(commands[cmd] === 'CLEAR') {
          setTerminalOutput([])
      } else if (commands[cmd]) {
          newOutput.push(commands[cmd])
          setTerminalOutput(newOutput)
      } else if (cmd.startsWith('ban ')) {
          newOutput.push({ type: 'error', content: `Executing ban protocol for ${cmd.split(' ')[1]}...` })
          setTerminalOutput(newOutput)
      } else {
          newOutput.push({ type: 'error', content: `bash: ${cmd}: command not found` })
          setTerminalOutput(newOutput)
      }
      setTerminalInput('')
  }

  const handleSort = (key) => {
      let direction = 'asc'
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc'
      }
      setSortConfig({ key, direction })
  }

  const sortedUsers = useMemo(() => {
      let sortableUsers = [...usersList]
      if (sortConfig.key) {
          sortableUsers.sort((a, b) => {
              if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
              if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
              return 0
          })
      }
      return sortableUsers
  }, [usersList, sortConfig])

  const filteredUsers = sortedUsers.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterType === 'ALL') return matchesSearch
    if (filterType === 'HIGH_RISK') return matchesSearch && u.risk_score === 'HIGH'
    if (filterType === 'WARNING') return matchesSearch && u.risk_score === 'MEDIUM'
    return matchesSearch
  })

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

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

  const toggleMaintenance = async () => {
    try {
      const newVal = !stats.maintenance
      const res = await fetch('/api/admin/settings/update', { 
        method: 'POST', 
        headers,
        body: JSON.stringify({ key: 'maintenance_mode', value: newVal.toString() })
      })
      if ((await res.json()).success) {
        setStats(prev => ({ ...prev, maintenance: newVal }))
        addToast('success', `Maintenance Mode ${newVal ? 'ENABLED' : 'DISABLED'}`)
      }
    } catch (e) { addToast('error', 'Failed to toggle maintenance') }
  }

  const handleBanUser = async () => {
    if (!confirmModal.data) return
    try {
      const { id, email } = confirmModal.data
      const res = await fetch('/api/admin/god-action', {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'BAN_USER', payload: { userId: id, email } })
      })
      if ((await res.json()).success) {
        addToast('success', 'User permanently banned')
        setUsersList(prev => prev.filter(u => u.id !== id))
        setConfirmModal({ ...confirmModal, show: false })
      }
    } catch (e) { addToast('error', e.message) }
  }

  const handleImpersonate = async (id) => {
      if(!confirm('Switch session to this user?')) return
      await impersonate(id)
  }

  const handleRegenerateKey = async () => {
    if (!apiKeyModal) return
    try {
      const res = await fetch('/api/admin/god-action', {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'REGENERATE_KEY', payload: { userId: apiKeyModal.id } })
      })
      if ((await res.json()).success) {
        addToast('success', 'API Key regenerated')
        setApiKeyModal(null)
      }
    } catch (e) { addToast('error', 'Failed to update API Key') }
  }

  const handlePostNotif = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST', headers, body: JSON.stringify(notifForm)
      })
      if ((await res.json()).success) {
        addToast('success', 'Broadcast sent successfully')
        setNotifForm({ title: '', message: '', type: 'INFO', image_url: '', target: 'ALL' })
        fetchData()
      }
    } catch (e) { addToast('error', 'Failed to send notification') }
  }

  const handleSavePopup = async () => {
      try {
          await fetch('/api/admin/settings/update', {
              method: 'POST', headers,
              body: JSON.stringify({ key: 'global_popup', value: JSON.stringify(popupConfig) })
          })
          addToast('success', 'Popup configuration saved')
      } catch (e) { addToast('error', 'Failed to save popup') }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] text-red-600 font-mono tracking-widest relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 text-center">
            <Hexagon size={100} className="animate-spin mb-8 mx-auto text-red-600 filter drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" strokeWidth={1} />
            <h1 className="text-5xl font-black mb-4 animate-pulse">GOD MODE</h1>
            <p className="text-sm text-red-800 tracking-[0.5em] mb-8">INITIALIZING SYSTEM CORE...</p>
            <div className="w-96 h-1.5 bg-red-950/50 rounded-full overflow-hidden mx-auto border border-red-900/30">
            <div className="h-full bg-red-600 animate-marquee w-1/3 blur-[2px]"></div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-[10px] text-red-900 opacity-50 font-mono">
                <div>LOADING SEC_MODULE... OK</div>
                <div>LOADING DB_SHARD... OK</div>
                <div>LOADING UI_KERNEL... OK</div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-slate-300 selection:bg-red-900/50 selection:text-white overflow-x-hidden">
      
      <div className="h-8 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 sticky top-0 z-[60]">
          <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-green-500"><Wifi size={10}/> SYSTEM ONLINE</span>
              <span className="flex items-center gap-1.5"><Cpu size={10}/> {stats.server_load}%</span>
              <span className="flex items-center gap-1.5"><HardDrive size={10}/> {stats.memory_usage}%</span>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-slate-600">IP: 192.168.1.X (Protected)</span>
              <span className="flex items-center gap-1.5 text-blue-500"><Clock size={10}/> {currentTime.toLocaleTimeString()}</span>
          </div>
      </div>

      <div className="sticky top-8 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-red-900/20 shadow-2xl transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            <div className="flex items-center gap-8 w-full lg:w-auto">
              <div className="flex items-center gap-5 group">
                <div className="p-3 bg-gradient-to-br from-red-600 to-red-950 rounded-2xl text-white shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse relative overflow-hidden transition-transform group-hover:scale-105 cursor-pointer">
                  <Shield size={28} className="relative z-10"/>
                  <div className="absolute inset-0 bg-red-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-[0.25em] uppercase leading-none drop-shadow-md">God Mode</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <p className="text-[10px] text-red-500 font-mono tracking-widest font-bold">V8.0 TITAN KERNEL</p>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              
              <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-medium text-slate-400">
                  <div className="flex items-center gap-2"><Server size={12} className="text-blue-500"/> Nodes Active: 4/4</div>
                  <div className="flex items-center gap-2"><ShieldAlert size={12} className="text-yellow-500"/> Threats: {stats.threat_level}</div>
                  <div className="flex items-center gap-2"><Activity size={12} className="text-green-500"/> Uptime: {stats.uptime}</div>
                  <div className="flex items-center gap-2"><Globe size={12} className="text-purple-500"/> Region: ASIA-ID</div>
              </div>
            </div>

            <div className="flex gap-2 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar shadow-inner">
              {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'security', icon: Lock, label: 'Security' },
                { id: 'bot', icon: Monitor, label: 'AI Bot' },
                { id: 'files', icon: Folder, label: 'Files' },
                { id: 'broadcast', icon: Radio, label: 'Comm' },
                { id: 'system', icon: Server, label: 'System' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap relative overflow-hidden
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg shadow-red-900/30 ring-1 ring-red-500/50' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <tab.icon size={14} className={activeTab === tab.id ? 'animate-bounce' : ''}/> 
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && <div className="absolute inset-0 bg-white/10 opacity-20"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 mt-8 space-y-8">

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                  { label: 'Total Users', value: stats.users, icon: Users, color: 'blue', sub: '+12% Growth' },
                  { label: 'Subdomains', value: stats.subdomains, icon: Globe, color: 'purple', sub: '98 Active' },
                  { label: 'Server Load', value: `${stats.server_load}%`, icon: Zap, color: 'red', sub: `${stats.requests_per_sec} req/s` },
                  { label: 'Storage', value: `${stats.disk_usage}%`, icon: Database, color: 'yellow', sub: 'SSD Healthy' }
              ].map((kpi, idx) => (
                  <div key={idx} className={`bg-[#0f1014] p-6 rounded-2xl border border-white/5 hover:border-${kpi.color}-500/30 transition-all group relative overflow-hidden shadow-lg`}>
                    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${kpi.color}-500/10 rounded-full blur-3xl group-hover:bg-${kpi.color}-500/20 transition-all duration-700`}></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`p-3 bg-${kpi.color}-500/10 rounded-xl text-${kpi.color}-500 border border-${kpi.color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                            <kpi.icon size={24}/>
                        </div>
                        <span className={`text-[10px] font-mono font-bold text-${kpi.color}-400 bg-${kpi.color}-500/5 px-2 py-1 rounded border border-${kpi.color}-500/10`}>{kpi.sub}</span>
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tight">{kpi.value}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-2">{kpi.label}</p>
                    <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                        <div className={`h-full bg-${kpi.color}-500 w-[70%] animate-pulse`}></div>
                    </div>
                  </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-[#0f1014] rounded-2xl border border-white/5 p-1 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-[#0f1014] to-[#0f1014] pointer-events-none"></div>
                <div className="bg-[#0a0a0a]/50 backdrop-blur-md p-6 h-[500px] flex flex-col rounded-xl relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                <Activity size={16} className="text-blue-500"/> Real-time Traffic Matrix
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">WS://STREAM.DOMKU.NET/LIVE_FEED</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> HTTP GET
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div> API POST
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-end justify-between gap-1.5 px-2 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            <div className="w-full h-px bg-white/20 border-t border-dashed border-white/30"></div>
                            <div className="w-full h-px bg-white/20 border-t border-dashed border-white/30"></div>
                            <div className="w-full h-px bg-white/20 border-t border-dashed border-white/30"></div>
                            <div className="w-full h-px bg-white/20 border-t border-dashed border-white/30"></div>
                        </div>

                        {trafficHistory.map((val, i) => {
                            const isHigh = val > 75
                            const isMed = val > 40
                            return (
                                <div key={i} className="w-full h-full flex flex-col justify-end relative group">
                                    <div 
                                        style={{height: `${val}%`}} 
                                        className={`w-full rounded-t-sm transition-all duration-500 ease-out relative overflow-hidden
                                            ${isHigh ? 'bg-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : isMed ? 'bg-blue-500/50' : 'bg-slate-700/40'}
                                        `}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black border border-white/20 text-[9px] text-white px-2 py-1 rounded z-20 whitespace-nowrap">
                                        Req: {val * 12}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="h-px w-full bg-white/10 mt-2"></div>
                    <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-2 px-2 uppercase">
                        <span>-60s</span><span>-45s</span><span>-30s</span><span>-15s</span><span>Now</span>
                    </div>
                </div>
              </div>

              <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-5 h-[500px] flex flex-col shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 relative z-10">
                    <span className="text-slate-300 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Terminal size={14} className="text-green-500"/> System Events
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 font-mono text-[10px] relative z-10">
                    {logs.length === 0 && <div className="text-center text-slate-600 py-10">Waiting for events stream...</div>}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 items-start p-2 rounded hover:bg-white/[0.03] transition-colors border-l-2 border-transparent hover:border-white/20">
                            <span className="text-slate-600 whitespace-nowrap min-w-[60px]">
                                {new Date(log.created_at).toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`font-bold ${
                                        log.action.includes('BAN') ? 'text-red-500' : 
                                        log.action.includes('LOGIN') ? 'text-green-400' : 
                                        log.action.includes('CREATE') ? 'text-blue-400' : 'text-slate-300'
                                    }`}>
                                        {log.action}
                                    </span>
                                    {log.ip_address && <span className="bg-white/5 px-1.5 rounded text-slate-500">{log.ip_address}</span>}
                                </div>
                                <p className="text-slate-400 truncate">{log.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#0f1014] rounded-2xl border border-white/5 flex flex-col h-[85vh] animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-600 to-purple-600"></div>
            
            <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-4 bg-[#0f1014]/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Users size={18} className="text-slate-300"/></div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">User Database</h2>
                    <p className="text-[10px] text-slate-500">{usersList.length} Accounts Registered</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10 hidden lg:block"></div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 animate-in slide-in-from-left duration-300">
                    <span className="text-xs text-red-400 font-bold">{selectedUsers.length} Selected</span>
                    <button className="text-[10px] font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-500 shadow-lg shadow-red-600/20 flex items-center gap-1"><Trash2 size={10}/> BULK BAN</button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-72 group">
                  <Search className="absolute left-3 top-3 text-slate-600 group-focus-within:text-white transition-colors" size={14}/>
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or IP..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-red-500/50 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="flex bg-[#0a0a0a] rounded-xl border border-white/10 p-1">
                    <button onClick={() => setFilterType('ALL')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterType === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>ALL</button>
                    <button onClick={() => setFilterType('HIGH_RISK')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterType === 'HIGH_RISK' ? 'bg-red-500/20 text-red-500' : 'text-slate-500 hover:text-red-400'}`}>RISK</button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar bg-[#0a0a0a]/50">
              <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#0f1014] text-slate-400 font-bold uppercase sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="p-4 w-12 border-b border-white/5"><input type="checkbox" className="rounded bg-black border-white/20 w-3 h-3 appearance-none checked:bg-blue-500 transition-all"/></th>
                          <th className="p-4 border-b border-white/5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>Identity <ChevronDown size={10} className="inline ml-1"/></th>
                          <th className="p-4 border-b border-white/5">Resources</th>
                          <th className="p-4 border-b border-white/5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('risk_score')}>Risk Score <ChevronDown size={10} className="inline ml-1"/></th>
                          <th className="p-4 border-b border-white/5">Joined At</th>
                          <th className="p-4 border-b border-white/5 text-right">Admin Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                      {paginatedUsers.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.03] group transition-all duration-200">
                              <td className="p-4"><input type="checkbox" className="rounded bg-black border-white/20 w-3 h-3 appearance-none checked:bg-blue-500 transition-all" checked={selectedUsers.includes(u.id)} onChange={() => {
                                  if(selectedUsers.includes(u.id)) setSelectedUsers(selectedUsers.filter(id => id !== u.id))
                                  else setSelectedUsers([...selectedUsers, u.id])
                              }}/></td>
                              <td className="p-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white border border-white/10 shadow-lg ${u.risk_score === 'HIGH' ? 'bg-red-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                                          {u.name.charAt(0)}
                                      </div>
                                      <div>
                                          <div className="font-bold text-white text-xs mb-0.5">{u.name}</div>
                                          <div className="text-slate-500 font-mono text-[10px] flex items-center gap-1.5">
                                              <Mail size={10}/> {u.email}
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center gap-2">
                                          <Globe size={10} className="text-blue-500"/>
                                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                              <div style={{width: `${(u.subdomains[0].count / 30) * 100}%`}} className="h-full bg-blue-500 rounded-full"></div>
                                          </div>
                                          <span className="text-[10px] text-slate-400">{u.subdomains[0].count}/30</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Activity size={10} className="text-purple-500"/>
                                          <span className="text-[10px] text-slate-400">{u.activity_logs[0].count} Events</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <span className={`px-3 py-1 rounded-full font-bold text-[10px] border flex items-center gap-1 w-fit ${
                                      u.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                      u.risk_score === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                      'bg-green-500/10 text-green-500 border-green-500/20'
                                  }`}>
                                      {u.risk_score === 'HIGH' ? <AlertOctagon size={10}/> : u.risk_score === 'MEDIUM' ? <AlertTriangle size={10}/> : <CheckCircle2 size={10}/>}
                                      {u.risk_score}
                                  </span>
                              </td>
                              <td className="p-4 font-mono text-slate-500 text-[10px]">
                                  {new Date(u.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </td>
                              <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                      <button onClick={() => handleImpersonate(u.id)} className="p-2 bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-400 shadow-sm" title="Login as User"><Eye size={14}/></button>
                                      <button onClick={() => setApiKeyModal(u)} className="p-2 bg-white/5 hover:bg-yellow-600 hover:text-white rounded-lg transition-all text-slate-400 shadow-sm" title="Reset API Key"><Key size={14}/></button>
                                      <button onClick={() => setConfirmModal({ show: true, title: 'Ban User', message: `Permanently ban ${u.email}? This cannot be undone.`, action: () => handleBanUser(u), data: u, isDanger: true })} className="p-2 bg-white/5 hover:bg-red-600 hover:text-white rounded-lg transition-all text-slate-400 shadow-sm" title="Ban User"><Ban size={14}/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#0f1014] flex justify-between items-center">
                <span className="text-[10px] text-slate-500">
                    Showing <strong className="text-white">{paginatedUsers.length}</strong> of <strong className="text-white">{filteredUsers.length}</strong> users
                </span>
                <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold text-white transition-colors border border-white/5">Previous</button>
                    <div className="flex items-center gap-1 px-2">
                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i+1 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-transparent text-slate-500 hover:bg-white/5'}`}>{i+1}</button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold text-white transition-colors border border-white/5">Next</button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-[500px] relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-6 z-10 text-right">
                            <h3 className="text-white font-bold text-sm uppercase">Global Threat Map</h3>
                            <p className="text-slate-500 text-[10px]">Real-time Attack Vectors</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="grid grid-cols-12 gap-2 opacity-30 rotate-12 scale-150">
                                {Array.from({length: 144}).map((_, i) => (
                                    <div key={i} className={`w-8 h-8 border border-white/20 rounded-full ${Math.random() > 0.95 ? 'bg-red-500 animate-ping' : ''}`}></div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-dashed border-red-500/30 rounded-full animate-spin-slow flex items-center justify-center">
                                    <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                                        <Shield size={48} className="text-red-500 animate-pulse"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 flex flex-col h-[500px]">
                        <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <Ban size={14} className="text-red-500"/> IP Blacklist
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <input value={ipForm} onChange={e => setIpForm(e.target.value)} placeholder="IP Address..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"/>
                            <button className="bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-2 text-xs font-bold"><Plus size={14}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {blacklist.length === 0 ? <p className="text-center text-slate-600 py-10 text-xs">No IP banned.</p> : blacklist.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div>
                                        <div className="text-white text-xs font-mono">{item.ip_address}</div>
                                        <div className="text-[10px] text-slate-500">{item.reason}</div>
                                    </div>
                                    <button className="text-slate-500 hover:text-red-500"><Trash2 size={12}/></button>
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

        {activeTab === 'bot' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
                <div className="lg:col-span-1 bg-[#0f1014] rounded-2xl border border-white/5 p-0 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-green-900/5 pointer-events-none"></div>
                    <div className="bg-[#111318] p-4 border-b border-white/5 flex items-center gap-3 relative z-10">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20"><Monitor size={20}/></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-[#111318] rounded-full animate-bounce"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">AI Command Center</h3>
                            <p className="text-[10px] text-green-400 animate-pulse">● System Intelligence Unit Online</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/20">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0"><Monitor size={14}/></div>
                            <div className="bg-[#1a1b23] p-3 rounded-2xl rounded-tl-none border border-white/5 text-xs text-slate-300 shadow-md">
                                <p className="mb-2">Halo Admin! Saya siap membantu. Berikut ringkasan hari ini:</p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-black/30 p-2 rounded border border-white/5">
                                        <div className="text-[9px] text-slate-500">Load</div>
                                        <div className="text-green-400 font-bold">{stats.server_load}%</div>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded border border-white/5">
                                        <div className="text-[9px] text-slate-500">Threats</div>
                                        <div className="text-red-400 font-bold">{stats.banned}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0"><Server size={14}/></div>
                            <div className="bg-blue-600/10 p-3 rounded-2xl rounded-tr-none border border-blue-500/20 text-xs text-white shadow-md">
                                Generate security report for last 24 hours.
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0"><Monitor size={14}/></div>
                            <div className="bg-[#1a1b23] p-3 rounded-2xl rounded-tl-none border border-white/5 text-xs text-slate-300 shadow-md">
                                <p><strong>Security Report Generated:</strong></p>
                                <ul className="list-disc ml-4 mt-1 space-y-1 text-[11px] text-slate-400">
                                    <li>24 SQL Injection attempts blocked.</li>
                                    <li>3 suspicious login locations detected.</li>
                                    <li>Firewall rules updated automatically.</li>
                                </ul>
                                <button className="mt-2 text-[10px] text-green-400 hover:underline flex items-center gap-1"><Download size={10}/> Download PDF</button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-[#111318] border-t border-white/5">
                        <div className="relative">
                            <input className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:border-green-500 outline-none transition-colors" placeholder="Tanya AI Bot..."/>
                            <button className="absolute right-3 top-3 text-green-500 hover:text-white transition-colors"><Send size={16}/></button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-[340px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2 relative z-10"><FileText size={14} className="text-blue-500"/> Daily Automated Reports</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10">
                            {botReports.map((report, i) => (
                                <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-blue-500/30">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="text-sm font-bold text-green-400 group-hover:text-green-300 flex items-center gap-2"><Monitor size={12}/> {report.title}</h4>
                                        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">{new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap pl-2 border-l-2 border-white/10 group-hover:border-blue-500/50 transition-colors">{report.message}</pre>
                                </div>
                            ))}
                            {botReports.length === 0 && <div className="text-center py-12 text-xs text-slate-600 italic">Bot belum menghasilkan laporan hari ini.</div>}
                        </div>
                    </div>

                    <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 h-[335px] flex flex-col">
                        <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Settings size={14} className="text-purple-500"/> Bot Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">Auto Reporting</span>
                                    <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                </div>
                                <p className="text-[10px] text-slate-500">Bot akan mengirim laporan lengkap setiap jam 00:00 WIB.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">Threat AI</span>
                                    <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                </div>
                                <p className="text-[10px] text-slate-500">AI akan menganalisis pola subdomain phising secara realtime.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">Auto Ban</span>
                                    <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-pointer"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                </div>
                                <p className="text-[10px] text-slate-500">Izinkan AI mem-banned user tanpa persetujuan admin.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">Self Healing</span>
                                    <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                                </div>
                                <p className="text-[10px] text-slate-500">Restart service otomatis jika memory usage {'>'} 90%.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {(activeTab === 'broadcast' || activeTab === 'system') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><LayoutTemplate size={20}/></div>
                        <div>
                            <h3 className="font-bold text-white">Global Popup Manager</h3>
                            <p className="text-[10px] text-slate-500">Kontrol pengumuman popup untuk semua user</p>
                        </div>
                    </div>
                    
                    <div className="space-y-5 relative z-10">
                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                            <span className="text-xs font-bold text-slate-300">Status Popup</span>
                            <button onClick={() => setPopupConfig({...popupConfig, active: !popupConfig.active})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg ${popupConfig.active ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-slate-700 text-slate-400'}`}>
                                {popupConfig.active ? 'ACTIVE' : 'DISABLED'}
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Judul</label>
                            <input value={popupConfig.title} onChange={e => setPopupConfig({...popupConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-colors"/>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Pesan</label>
                            <textarea value={popupConfig.message} onChange={e => setPopupConfig({...popupConfig, message: e.target.value})} rows="4" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-colors resize-none"/>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Gambar URL (Opsional)</label>
                            <div className="flex gap-2">
                                <input value={popupConfig.image} onChange={e => setPopupConfig({...popupConfig, image: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-colors"/>
                                <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white"><ImageIcon size={16}/></button>
                            </div>
                        </div>

                        <button onClick={handleSavePopup} className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                            <Save size={14}/> SIMPAN KONFIGURASI
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden flex flex-col justify-center text-center group">
                        <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className={`mx-auto p-5 rounded-full mb-4 transition-all duration-500 ${stats.maintenance ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                <Power size={40}/>
                            </div>
                            <h3 className="text-xl font-black text-white mb-1">EMERGENCY SWITCH</h3>
                            <p className="text-xs text-slate-400 mb-6">Mode Maintenance akan mematikan akses publik.</p>
                            
                            <button onClick={toggleMaintenance} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${stats.maintenance ? 'bg-white text-red-600' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                                {stats.maintenance ? 'NONAKTIFKAN MAINTENANCE' : 'AKTIFKAN MAINTENANCE'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0f1014] rounded-2xl border border-white/5 p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2"><Settings size={14}/> Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-all">
                                <RefreshCw size={20} className="text-blue-500"/>
                                <span className="text-[10px] text-slate-300 font-bold">Clear Cache</span>
                            </button>
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-all">
                                <Database size={20} className="text-yellow-500"/>
                                <span className="text-[10px] text-slate-300 font-bold">Backup DB</span>
                            </button>
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-all">
                                <RotateCcw size={20} className="text-green-500"/>
                                <span className="text-[10px] text-slate-300 font-bold">Restart API</span>
                            </button>
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex flex-col items-center gap-2 transition-all">
                                <Shield size={20} className="text-purple-500"/>
                                <span className="text-[10px] text-slate-300 font-bold">Audit Logs</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#16181d] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${confirmModal.isDanger ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                    <div className={`p-4 rounded-full ${confirmModal.isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {confirmModal.isDanger ? <AlertTriangle size={32}/> : <Info size={32}/>}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">{confirmModal.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{confirmModal.message}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({...confirmModal, show: false})} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 border border-white/5">Cancel</button>
                    <button onClick={confirmModal.action} className={`flex-1 py-3 rounded-xl text-xs font-bold text-white shadow-lg ${confirmModal.isDanger ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}>Confirm</button>
                </div>
            </div>
        </div>
      )}

      {apiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#16181d] border border-yellow-500/20 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <div className="flex justify-center mb-4"><div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20"><Key size={24} className="text-yellow-500"/></div></div>
                <h3 className="text-lg font-bold text-white text-center mb-2">Regenerate Key?</h3>
                <p className="text-xs text-slate-400 text-center mb-6 px-4 leading-relaxed">
                    API Key lama untuk <strong className="text-white">{apiKeyModal.email}</strong> akan hangus. User harus mengganti key di aplikasi mereka.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setApiKeyModal(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300">Batal</button>
                    <button onClick={handleRegenerateKey} className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-yellow-900/20">Regenerate</button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard
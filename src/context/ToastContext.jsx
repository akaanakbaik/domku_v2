import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000) // Auto close 4s
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right-10 duration-300 min-w-[300px] max-w-sm ${
            toast.type === 'success' ? 'bg-[#111318]/90 border-green-500/30 text-green-400' :
            toast.type === 'error' ? 'bg-[#111318]/90 border-red-500/30 text-red-400' :
            toast.type === 'warning' ? 'bg-[#111318]/90 border-yellow-500/30 text-yellow-400' :
            'bg-[#111318]/90 border-blue-500/30 text-blue-400'
          }`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <p className="text-xs font-semibold flex-1 leading-relaxed">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="hover:text-white transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

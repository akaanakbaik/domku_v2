import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state agar render berikutnya menampilkan UI fallback
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Anda bisa mengirim log error ini ke layanan pelaporan error jika mau
    console.error("Uncaught error:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4 font-sans animate-in fade-in duration-300">
          <div className="bg-[#16181d] border border-red-900/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
            
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={32} className="text-red-500"/>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Maaf, aplikasi mengalami gangguan tak terduga. Sistem kami telah mencatat kejadian ini.
            </p>
            
            {/* Error Message Teknis (Opsional, bagus untuk debug) */}
            <div className="bg-black/30 p-4 rounded-lg border border-white/5 mb-6 text-left overflow-auto max-h-32 custom-scrollbar">
                <p className="text-[10px] text-red-400 font-mono break-all leading-tight">
                    {this.state.error?.toString() || "Unknown Error"}
                </p>
            </div>

            <button 
                onClick={this.handleReload} 
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
            >
                <RefreshCw size={16}/> Muat Ulang Halaman
            </button>
            
            <p className="text-[10px] text-slate-600 mt-4">
                Jika masalah berlanjut, hubungi admin@domku.my.id
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

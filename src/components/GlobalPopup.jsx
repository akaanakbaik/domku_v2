import React, { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const GlobalPopup = () => {
  const [show, setShow] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    const checkPopup = async () => {
      // Cek apakah user sudah menutup popup ini sebelumnya di sesi ini
      const hasSeen = sessionStorage.getItem('seen_popup_session')
      if (hasSeen) return

      try {
        // Ambil data dari database (Table system_settings)
        const { data: settings, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'global_popup')
          .single()

        if (error) throw error

        if (settings && settings.value) {
          const popupConfig = JSON.parse(settings.value)
          
          // Hanya tampilkan jika statusnya ACTIVE
          if (popupConfig.active) {
            setData(popupConfig)
            // Delay sedikit agar animasi smooth saat halaman baru load
            setTimeout(() => setShow(true), 1000) 
          }
        }
      } catch (error) {
        // Silent error agar tidak mengganggu user jika DB belum siap
        console.log("Popup system standby.")
      }
    }

    checkPopup()
  }, [])

  const handleClose = () => {
    setShow(false)
    // Simpan status bahwa user sudah melihat popup ini
    sessionStorage.setItem('seen_popup_session', 'true')
  }

  if (!show || !data) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop Gelap */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      ></div>
      
      {/* Card Popup */}
      <div className="relative bg-[#1a1b23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-300">
        
        {/* Tombol Close X */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors z-20 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Gambar (Jika Ada) */}
        {data.image && (
          <div className="w-full h-40 md:h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] to-transparent z-10"></div>
            <img 
              src={data.image} 
              alt="Popup Visual" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'} 
            />
          </div>
        )}

        {/* Konten Teks */}
        <div className={`p-6 ${data.image ? '-mt-12 relative z-10' : ''} text-center`}>
          {!data.image && (
            <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 border border-blue-500/30">
              <Bell size={24} />
            </div>
          )}
          
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            {data.title || 'Pengumuman'}
          </h3>
          
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {data.message || 'Selamat datang di layanan kami.'}
          </p>

          <button 
            onClick={handleClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            {data.btnText || 'Mengerti'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlobalPopup
import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Github, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-blue-900/20 bg-[#0b0c10]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">

        {/* Kiri: Brand & Desc */}
        <div className="text-center md:text-left">
          <h4 className="text-white font-bold text-sm tracking-wider flex items-center justify-center md:justify-start gap-2">
            DOMKU MANAGER <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-600/30">v2.0</span>
          </h4>
          <p className="text-slate-500 text-xs mt-1">
            Free Subdomain & DNS Management Service
          </p>
        </div>

        {/* Tengah: Legal Links (BARU) */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-400">
            <Link to="/terms" className="hover:text-white transition-colors hover:underline">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors hover:underline">Privacy Policy</Link>
            <Link to="/api" className="hover:text-white transition-colors hover:underline">API Docs</Link>
        </div>

        {/* Kanan: Credits & Socials */}
        <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
                href="https://akadev.me"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-bold"
            >
                Aka
            </a>
            </div>

            <div className="flex gap-4">
            <a
                href="https://github.com/akaanakbaik"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
            >
                <Github size={16} />
            </a>
            <a
                href="https://www.instagram.com/kenal.aka"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
            >
                <Instagram size={16} />
            </a>
            </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer

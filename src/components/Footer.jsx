import React from 'react'
import { Heart, Github, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-blue-900/20 bg-[#0b0c10]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-sm tracking-wider">DOMKU MANAGER</h4>
            <p className="text-slate-500 text-xs mt-1">Free Subdomain & DNS Management Service</p>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a href="https://akadev.me" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">Aka</a>
            <span className="mx-1">•</span>
            <span>Indonesia 🇮🇩</span>
        </div>

        <div className="flex gap-4">
            <a href="https://github.com/akaanakbaik" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors"><Github size={16}/></a>
            <a href=https://www.instagram.com/kenal.aka" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors"><Instagram size={16}/></a>
        </div>

      </div>
    </footer>
  )
}

export default Footer

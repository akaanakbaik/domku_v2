import React from 'react'
import { ShieldAlert, Gavel, Ban, FileWarning, Scale, AlertTriangle, UserX, Globe } from 'lucide-react'

const Terms = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 md:py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="text-center mb-12 md:mb-16 space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">
          <Scale size={12} className="md:w-3.5 md:h-3.5" /> Perjanjian Pengguna
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Syarat & Ketentuan Layanan</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed px-2">
          Harap baca dokumen ini dengan saksama sebelum menggunakan layanan Domku. Penggunaan layanan kami menyiratkan persetujuan mutlak Anda terhadap aturan yang berlaku.
        </p>
        <p className="text-[10px] md:text-xs text-slate-500 font-mono">Terakhir diperbarui: 24 Januari 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 relative">
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden md:block"></div>

        <div className="relative pl-0 md:pl-16">
          <div className="hidden md:flex absolute left-4 -translate-x-1/2 top-0 w-8 h-8 rounded-full bg-[#0b0c10] border border-blue-500/30 items-center justify-center text-blue-500 font-bold text-xs shadow-[0_0_15px_rgba(59,130,246,0.2)]">1</div>

          <div className="bg-[#111318] p-5 md:p-8 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform"><Gavel size={18} className="md:w-5 md:h-5" /></div>
              <h2 className="text-lg md:text-xl font-bold text-white">Penerimaan Syarat</h2>
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-6 md:leading-7 text-justify">
              Dengan mendaftar, mengakses, atau menggunakan layanan Domku Manager (domku.my.id), Anda secara sadar dan sukarela menyetujui untuk terikat oleh Syarat dan Ketentuan ini ("Ketentuan"). Layanan ini disediakan dengan prinsip "as is" (sebagaimana adanya) dan "as available" (sebagaimana tersedia), tanpa jaminan ketersediaan uptime 100% atau kebebasan dari kesalahan teknis.
            </p>
          </div>
        </div>

        <div className="relative pl-0 md:pl-16">
          <div className="hidden md:flex absolute left-4 -translate-x-1/2 top-0 w-8 h-8 rounded-full bg-[#0b0c10] border border-red-500/30 items-center justify-center text-red-500 font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.2)]">2</div>

          <div className="bg-[#1a0f0f] p-5 md:p-8 rounded-2xl border border-red-500/20 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 text-red-500/5 group-hover:text-red-500/10 transition-colors duration-500"><Ban size={150} className="md:w-[200px] md:h-[200px]" /></div>

            <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
              <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg text-red-500 animate-pulse"><AlertTriangle size={18} className="md:w-5 md:h-5" /></div>
              <h2 className="text-lg md:text-xl font-bold text-white">Kebijakan Penggunaan Terlarang (Zero Tolerance)</h2>
            </div>

            <div className="relative z-10 space-y-3 md:space-y-4">
              <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                Kami menerapkan kebijakan <span className="text-red-400 font-bold">TOLERANSI NOL (ZERO TOLERANCE)</span>. Akun Anda akan diblokir permanen seketika jika subdomain Anda terindikasi digunakan untuk aktivitas berikut:
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {[
                  { title: "Phishing & Scam", desc: "Pencurian data, halaman login palsu, penipuan finansial." },
                  { title: "Perjudian Online", desc: "Situs slot, poker, togel, atau promosi judi." },
                  { title: "Konten Ilegal", desc: "Pornografi, eksploitasi anak, obat terlarang, terorisme." },
                  { title: "Malware & Virus", desc: "Distribusi software berbahaya, exploit, atau ransomware." },
                  { title: "Spamming", desc: "Pengiriman email massal atau bot traffic generator." },
                  { title: "Hate Speech", desc: "Konten yang memicu kebencian SARA atau kekerasan." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 md:p-3 bg-red-950/20 rounded-lg border border-red-900/30 hover:bg-red-900/30 transition-colors">
                    <ShieldAlert size={14} className="text-red-500 mt-0.5 shrink-0 md:w-4 md:h-4"/>
                    <div>
                      <strong className="block text-red-200 text-[10px] md:text-xs uppercase tracking-wide mb-0.5">{item.title}</strong>
                      <span className="text-slate-400 text-[10px] md:text-xs leading-snug">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative pl-0 md:pl-16">
          <div className="hidden md:flex absolute left-4 -translate-x-1/2 top-0 w-8 h-8 rounded-full bg-[#0b0c10] border border-orange-500/30 items-center justify-center text-orange-500 font-bold text-xs shadow-[0_0_15px_rgba(249,115,22,0.2)]">3</div>

          <div className="bg-[#111318] p-5 md:p-8 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all group">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg text-orange-500"><UserX size={18} className="md:w-5 md:h-5" /></div>
              <h2 className="text-lg md:text-xl font-bold text-white">Penangguhan & Pemblokiran Akun</h2>
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-6 md:leading-7 text-justify">
              Domku berhak secara sepihak untuk <strong>menonaktifkan, menghapus subdomain, atau memblokir akses akun Anda secara permanen</strong> tanpa peringatan sebelumnya apabila:
            </p>
            <ul className="list-disc list-outside ml-4 md:ml-5 mt-2 md:mt-3 text-slate-400 text-xs md:text-sm space-y-1">
              <li>Terdeteksi pelanggaran terhadap Poin 2 (Aktivitas Terlarang).</li>
              <li>Ditemukan penggunaan otomatisasi bot yang membebani server kami.</li>
              <li>Adanya permintaan hukum dari otoritas berwenang (Kepolisian/Kominfo).</li>
              <li>Mencoba meretas, memindai (scanning), atau mengeksploitasi celah keamanan sistem Domku.</li>
            </ul>
          </div>
        </div>

        <div className="relative pl-0 md:pl-16">
          <div className="hidden md:flex absolute left-4 -translate-x-1/2 top-0 w-8 h-8 rounded-full bg-[#0b0c10] border border-blue-500/30 items-center justify-center text-blue-500 font-bold text-xs shadow-[0_0_15px_rgba(59,130,246,0.2)]">4</div>

          <div className="bg-[#111318] p-5 md:p-8 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileWarning size={18} className="md:w-5 md:h-5" /></div>
              <h2 className="text-lg md:text-xl font-bold text-white">Batasan Tanggung Jawab</h2>
            </div>
            <p className="text-slate-400 text-xs md:text-sm leading-6 md:leading-7 text-justify">
              Domku hanyalah penyedia layanan manajemen DNS. Kami <strong>tidak bertanggung jawab</strong> atas konten, materi, atau aktivitas yang dilakukan pengguna pada subdomain yang mereka buat. Segala konsekuensi hukum akibat penyalahgunaan subdomain sepenuhnya menjadi tanggung jawab pengguna pembuat subdomain tersebut. Kami akan bekerja sama penuh dengan penegak hukum jika diperlukan data pengguna untuk proses investigasi.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-[10px] md:text-xs mb-2">Punya pertanyaan atau ingin melaporkan penyalahgunaan?</p>
        <a href="mailto:khaliqarrasyidabdul@gmail.com" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs md:text-sm font-bold transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/10">
          <Globe size={12} className="md:w-3.5 md:h-3.5"/> Hubungi Tim Abuse: akaanakbaik17@proton.me
        </a>
      </div>
    </div>
  )
}

export default Terms

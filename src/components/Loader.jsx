import React from 'react'

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0b0c10] backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="animate-pulse text-blue-500 font-bold tracking-widest text-sm">SECURING...</div>
      </div>
    </div>
  )
}

export default Loader

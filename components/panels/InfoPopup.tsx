'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  content: React.ReactNode
}

export function InfoPopup({ content }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-4 h-4 rounded-full border border-zinc-600 text-zinc-500 hover:border-zinc-400 hover:text-zinc-300 transition-colors flex items-center justify-center text-[10px] font-bold leading-none"
        title="About this data"
      >
        i
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 w-64 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-4 text-xs text-zinc-300 leading-relaxed">
          {content}
        </div>
      )}
    </div>
  )
}

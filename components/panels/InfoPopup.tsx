'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  content: React.ReactNode
}

export function InfoPopup({ content }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect()
      setPos({
        top: r.bottom + 6,
        right: window.innerWidth - r.right,
      })
    }

    function onDown(e: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((s) => !s)}
        className="w-4 h-4 rounded-full border border-zinc-600 text-zinc-500 hover:border-zinc-400 hover:text-zinc-300 transition-colors flex items-center justify-center text-[10px] font-bold leading-none"
        title="About this data"
      >
        i
      </button>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          ref={popupRef}
          className="fixed z-[9999] w-64 max-h-80 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-4 text-xs text-zinc-300 leading-relaxed"
          style={{ top: pos.top, right: pos.right }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  )
}

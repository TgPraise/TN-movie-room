import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

export default function DropZone({ onFiles, compact }) {
  const [over, setOver] = useState(false)
  const depth = useRef(0)
  const input = useRef(null)

  // Stop the browser from navigating to a file dropped outside the zone.
  useEffect(() => {
    const stop = (e) => e.preventDefault()
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => {
      window.removeEventListener('dragover', stop)
      window.removeEventListener('drop', stop)
    }
  }, [])

  const handlers = {
    onDragEnter: (e) => { e.preventDefault(); depth.current++; setOver(true) },
    onDragLeave: () => { if (--depth.current <= 0) { depth.current = 0; setOver(false) } },
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      depth.current = 0
      setOver(false)
      onFiles(e.dataTransfer.files)
    },
  }

  return (
    <div
      {...handlers}
      className={`relative flex flex-col items-center justify-center rounded-3xl bg-ink-900 text-center transition-all duration-300 ${
        compact ? 'min-h-40 px-6 py-8' : 'min-h-[22rem] px-6 py-16'
      } ${over ? 'scale-[1.01]' : ''}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-2 rounded-[1.25rem] border-2 border-dashed transition-colors duration-300 ${
          over ? 'border-accent' : 'border-ink-700 animate-breathe'
        }`}
      />
      <div className={`mb-5 grid size-14 place-items-center rounded-2xl transition-colors ${over ? 'bg-accent text-ink-950' : 'bg-ink-800 text-accent'}`}>
        <Upload size={24} />
      </div>
      <h2 className={`font-extrabold tracking-tight ${compact ? 'text-lg' : 'text-3xl sm:text-4xl'}`}>
        {over ? 'Release to add' : 'Drop files here'}
      </h2>
      {!compact && (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-dim">
          Movies, ZIPs, PDFs, anything. Files stay in this tab and are never uploaded.
        </p>
      )}
      <button
        onClick={() => input.current.click()}
        className="relative mt-6 rounded-full bg-mist px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-white active:scale-95"
      >
        Browse files
      </button>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        onChange={(e) => { onFiles(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}

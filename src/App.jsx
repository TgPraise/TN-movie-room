import { useState } from 'react'
import { Menu, Trash2, X } from 'lucide-react'
import DropZone from './components/DropZone'
import FileList from './components/FileList'
import Preview from './components/Preview'
import { useFiles } from './hooks/useFiles'
import { downloadFile, formatBytes } from './utils/format'

export default function App() {
  const { items, add, remove, clear } = useFiles()
  const [selectedId, setSelectedId] = useState(null)
  const [open, setOpen] = useState(true)

  const selected = items.find((i) => i.id === selectedId) ?? items[0]
  const total = items.reduce((s, i) => s + i.file.size, 0)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <header className="mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Holdall</h1>
          <p className="mt-1 text-sm text-dim">A shelf for files that never leave your browser.</p>
        </header>
        <DropZone onFiles={add} />
      </main>
    )
  }

  const select = (id) => {
    setSelectedId(id)
    if (window.innerWidth < 1024) setOpen(false) // on small screens, reveal the file
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Preview fills the whole screen; the panel floats over it. */}
      <Preview file={selected?.file} />

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close file panel' : 'Open file panel'}
        aria-expanded={open}
        className="fixed left-4 top-4 z-50 grid size-11 place-items-center rounded-full bg-ink-900/80 text-mist ring-1 ring-ink-700 backdrop-blur transition hover:bg-ink-800 active:scale-95"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}

      <aside
        inert={open ? undefined : ''}
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(26rem,100vw)] flex-col border-r border-ink-800 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <header className="flex h-[4.75rem] shrink-0 items-center pl-20">
          <h1 className="text-lg font-extrabold tracking-tight">Holdall</h1>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          <DropZone compact onFiles={add} />
          <div className="flex items-center justify-between px-1 text-sm text-dim">
            <span>
              {items.length} {items.length === 1 ? 'file' : 'files'}, {formatBytes(total)}
            </span>
            <button onClick={clear} className="flex items-center gap-1.5 transition hover:text-mist">
              <Trash2 size={15} /> Clear all
            </button>
          </div>
          <FileList
            items={items}
            selectedId={selected?.id}
            onSelect={select}
            onRemove={remove}
            onDownload={downloadFile}
          />
        </div>
      </aside>
    </div>
  )
}

import { Archive, Check, Download, File, FileText, Film, Image, Music, X } from 'lucide-react'
import { formatBytes, getExt, getKind } from '../utils/format'

const ICONS = { image: Image, video: Film, audio: Music, pdf: FileText, text: FileText, archive: Archive, other: File }

function Row({ item, selected, onSelect, onRemove, onDownload }) {
  const { file, status, progress } = item
  const Icon = ICONS[getKind(file)]
  const ext = getExt(file.name)
  const pct = Math.round(progress * 100)

  return (
    <li
      className={`animate-pop rounded-2xl p-3 transition-colors ${
        selected ? 'bg-ink-800 ring-1 ring-accent/50' : 'bg-ink-900 hover:bg-ink-800/70'
      }`}
    >
      <div className="flex items-center gap-3">
        <button onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Preview ${file.name}`}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-700/60 text-accent">
            <Icon size={20} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{file.name}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-xs text-dim">
              {ext && <span className="rounded bg-ink-700 px-1.5 py-px font-semibold text-mist">{ext}</span>}
              <span>{formatBytes(file.size)}</span>
              <span className="truncate">{file.type || 'Unknown type'}</span>
            </span>
          </span>
        </button>

        <span className="hidden w-14 text-right text-xs text-dim sm:block">
          {status === 'ready' ? <Check size={16} className="ml-auto text-accent" /> : status === 'error' ? 'Failed' : `${pct}%`}
        </span>
        <button onClick={onDownload} title="Download" aria-label="Download" className="rounded-lg p-2 text-dim transition hover:bg-ink-700 hover:text-mist">
          <Download size={17} />
        </button>
        <button onClick={onRemove} title="Remove" aria-label="Remove" className="rounded-lg p-2 text-dim transition hover:bg-ink-700 hover:text-mist">
          <X size={17} />
        </button>
      </div>

      {status !== 'ready' && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-700" role="progressbar" aria-valuenow={pct}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      )}
    </li>
  )
}

export default function FileList({ items, selectedId, onSelect, onRemove, onDownload }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <Row
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={() => onSelect(item.id)}
          onRemove={() => onRemove(item.id)}
          onDownload={() => onDownload(item.file)}
        />
      ))}
    </ul>
  )
}

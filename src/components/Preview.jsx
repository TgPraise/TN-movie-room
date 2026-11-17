import { lazy, Suspense, useEffect, useState } from 'react'
import { Eye, Sparkles } from 'lucide-react'
import { getKind } from '../utils/format'

const SoftwarePlayer = lazy(() => import('./SoftwarePlayer'))
const TEXT_LIMIT = 64 * 1024
const MEDIA = ['image', 'video', 'audio', 'pdf']

export default function Preview({ file }) {
  const kind = file ? getKind(file) : null
  const [url, setUrl] = useState(null)
  const [text, setText] = useState('')

  // The object URL exists only while this file is being previewed.
  useEffect(() => {
    if (!file || !MEDIA.includes(kind)) return setUrl(null)
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file, kind])

  // Text previews read only the first 64 KB.
  useEffect(() => {
    if (kind !== 'text') return setText('')
    let live = true
    file.slice(0, TEXT_LIMIT).text().then((t) => live && setText(t))
    return () => { live = false }
  }, [file, kind])

  let body
  if (!file) {
    body = <Empty>Select a file to preview it here.</Empty>
  } else if (kind === 'image') {
    body = url && <img src={url} alt={file.name} className="h-full w-full object-contain" />
  } else if (kind === 'video') {
    body = url && <VideoPlayer key={url} url={url} file={file} />
  } else if (kind === 'audio') {
    body = url && <audio key={url} src={url} controls className="w-full max-w-xl px-6" />
  } else if (kind === 'pdf') {
    body = url && <iframe title={file.name} src={url} className="h-full w-full bg-white" />
  } else if (kind === 'text') {
    body = (
      <pre className="h-full w-full overflow-auto bg-ink-950 p-6 pt-20 text-xs leading-relaxed text-mist/90">
        {text}
        {file.size > TEXT_LIMIT && '\n\n… showing the first 64 KB'}
      </pre>
    )
  } else {
    body = <Empty>This file type can’t be previewed. You can still download it.</Empty>
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {body}
    </div>
  )
}

function Empty({ children }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-sm text-dim">
      <Eye size={22} />
      <p className="max-w-56">{children}</p>
    </div>
  )
}

// Plays natively first (fast, hardware decoded). If the browser can't show the
// picture (HEVC, 10-bit, AVI, ...), it switches to the compatibility player.
function VideoPlayer({ url, file }) {
  const [soft, setSoft] = useState(false)

  const checkFrames = (e) => {
    const v = e.currentTarget
    setTimeout(() => {
      const q = v.getVideoPlaybackQuality?.()
      if (!v.paused && q && q.totalVideoFrames === 0) setSoft(true)
    }, 1500)
  }

  return (
    <div className="relative h-full w-full">
      {soft ? (
        <Suspense fallback={null}>
          <SoftwarePlayer file={file} />
        </Suspense>
      ) : (
        <video
          src={url}
          controls
          onLoadedMetadata={(e) => e.currentTarget.videoWidth === 0 && setSoft(true)}
          onPlaying={checkFrames}
          onError={() => setSoft(true)}
          className="h-full w-full bg-black object-contain"
        />
      )}
      <button
        onClick={() => setSoft((s) => !s)}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-ink-900/80 px-4 py-2.5 text-xs font-semibold text-mist ring-1 ring-ink-700 backdrop-blur transition hover:bg-ink-800"
      >
        <Sparkles size={14} className="text-accent" />
        {soft ? 'Use standard player' : 'Compatibility mode'}
      </button>
    </div>
  )
}

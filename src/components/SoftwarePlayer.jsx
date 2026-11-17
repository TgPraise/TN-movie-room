import { useEffect, useRef, useState } from 'react'
import AVPlayer from '@libmedia/avplayer'
import { Loader2, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, '0')
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${m}:${ss}` : `${m}:${ss}`
}

// Compatibility player: demuxes the local File and decodes video/audio with
// WebCodecs when the browser supports the codec, or WebAssembly decoders
// (bundled in /public/libmedia) when it doesn't, e.g. HEVC, AC3, DTS, AVI, WMV.
export default function SoftwarePlayer({ file }) {
  const box = useRef(null)
  const wrap = useRef(null)
  const player = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let dead = false
    let p
    let ro
    // Deferred so React StrictMode's immediate remount doesn't build two players.
    const t = setTimeout(async () => {
      try {
        p = new AVPlayer({
          container: box.current,
          wasmBaseUrl: new URL(`${import.meta.env.BASE_URL}libmedia`, location.href).href.replace(/\/$/, ''),
          enableHardware: true,
          enableWebCodecs: true,
          enableWorker: true,
          enableAudioWorklet: true,
        })
        player.current = p
        p.on(AVPlayer.Events.TIME, (pts) => !dead && setTime(Number(pts)))
        p.on(AVPlayer.Events.PLAYED, () => !dead && setPlaying(true))
        p.on(AVPlayer.Events.PAUSED, () => !dead && setPlaying(false))
        p.on(AVPlayer.Events.ENDED, () => !dead && setPlaying(false))
        p.on(AVPlayer.Events.ERROR, (e) => {
          if (dead) return
          setError(e?.message || 'Playback failed')
          setStatus('error')
        })
        ro = new ResizeObserver(() => {
          const r = box.current?.getBoundingClientRect()
          if (r && r.width && r.height) p.resize(Math.round(r.width), Math.round(r.height))
        })
        ro.observe(box.current)

        await p.load(file)
        if (dead) return
        setDur(Number(p.getDuration()))
        setStatus('ready')
        await p.play()
      } catch (e) {
        if (dead) return
        setError(e?.message || 'This file could not be opened')
        setStatus('error')
      }
    }, 60)

    return () => {
      dead = true
      clearTimeout(t)
      ro?.disconnect()
      p?.destroy().catch(() => {})
      player.current = null
    }
  }, [file])

  const toggle = () => (playing ? player.current?.pause() : player.current?.play())
  const seek = (e) => player.current?.seek(BigInt(Math.round(+e.target.value)))
  const mute = () => {
    player.current?.setVolume(muted ? 1 : 0, true)
    setMuted(!muted)
  }
  const full = () => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen())

  return (
    <div ref={wrap} className="relative h-full w-full bg-black">
      <div ref={box} className="h-full w-full" onClick={status === 'ready' ? toggle : undefined} />

      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center text-sm text-dim">
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin" /> Preparing compatibility player…
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-x-4 top-1/2 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-ink-900 p-5 text-center text-sm leading-relaxed ring-1 ring-ink-700">
          <p className="font-semibold">This file couldn’t be played in the browser.</p>
          <p className="mt-1 text-dim">{error}. Use the download button in the file panel and open it in VLC.</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
          <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid size-10 place-items-center rounded-full bg-mist text-ink-950 transition active:scale-95">
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <span className="w-12 text-right text-xs tabular-nums text-mist">{clock(time)}</span>
          <input type="range" min={0} max={dur || 1} step={1000} value={Math.min(time, dur)} onChange={seek} aria-label="Seek" className="h-1 flex-1 cursor-pointer accent-accent" />
          <span className="w-12 text-xs tabular-nums text-dim">{clock(dur)}</span>
          <button onClick={mute} aria-label="Mute" className="p-2 text-mist">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          <button onClick={full} aria-label="Fullscreen" className="p-2 text-mist"><Maximize size={18} /></button>
        </div>
      )}
    </div>
  )
}

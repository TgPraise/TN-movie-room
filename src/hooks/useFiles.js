import { useCallback, useRef, useState } from 'react'

let nextId = 0

// Holds selected files and "processes" each one by streaming it through a reader.
// Chunks are discarded as they arrive, so memory stays flat even for multi-GB files.
export function useFiles() {
  const [items, setItems] = useState([])
  const removed = useRef(new Set())
  const queue = useRef(Promise.resolve())

  const patch = useCallback(
    (id, p) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i))),
    []
  )

  const scan = useCallback(
    async ({ id, file }) => {
      if (removed.current.has(id)) return
      if (file.size === 0) return patch(id, { status: 'ready', progress: 1 })
      patch(id, { status: 'reading' })
      try {
        const reader = file.stream().getReader()
        let read = 0
        let last = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (removed.current.has(id)) return reader.cancel()
          read += value.byteLength
          const now = performance.now()
          if (now - last > 80) {
            last = now
            patch(id, { progress: read / file.size })
          }
        }
        patch(id, { status: 'ready', progress: 1 })
      } catch {
        patch(id, { status: 'error' })
      }
    },
    [patch]
  )

  const add = useCallback(
    (fileList) => {
      const fresh = Array.from(fileList).map((file) => ({ id: ++nextId, file, status: 'queued', progress: 0 }))
      if (!fresh.length) return
      setItems((l) => [...l, ...fresh])
      fresh.forEach((it) => {
        queue.current = queue.current.then(() => scan(it))
      })
    },
    [scan]
  )

  const remove = useCallback((id) => {
    removed.current.add(id)
    setItems((l) => l.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => {
    items.forEach((i) => removed.current.add(i.id))
    setItems([])
  }, [items])

  return { items, add, remove, clear }
}

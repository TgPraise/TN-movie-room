export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const v = bytes / 1024 ** i
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`
}

export function getExt(name) {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i + 1).toLowerCase() : ''
}

const TEXT_EXT = ['txt', 'md', 'json', 'csv', 'log', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'xml', 'yml', 'yaml']
const ARCHIVE_EXT = ['zip', 'rar', '7z', 'tar', 'gz', 'tgz']

// Returns: image | video | audio | pdf | text | archive | other
export function getKind(file) {
  const t = file.type || ''
  const ext = getExt(file.name)
  if (t.startsWith('image/')) return 'image'
  if (t.startsWith('video/')) return 'video'
  if (t.startsWith('audio/')) return 'audio'
  if (t === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (t.startsWith('text/') || t === 'application/json' || TEXT_EXT.includes(ext)) return 'text'
  if (ARCHIVE_EXT.includes(ext) || /zip|compressed|tar/.test(t)) return 'archive'
  return 'other'
}

// Object URL pointing at the File itself — nothing is copied into memory.
export function downloadFile(file) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

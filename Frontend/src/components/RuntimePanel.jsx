import { useEffect, useState } from 'react'
import { IconDatabase } from './Icons.jsx'

function fmtUptime(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

// Read-only runtime facts (GET /api/system) so the side rail shows the
// API process and storage, not invented metadata.
export default function RuntimePanel({ token }) {
  const [sys, setSys] = useState(null)
  const [tick, setTick] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    const load = () => {
      fetch('/api/system', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          if (live) {
            setSys(data)
            setError('')
          }
        })
        .catch((status) => {
          if (live) setError(status === 401 ? 'Session expired' : 'unavailable')
        })
    }
    load()
    const poll = setInterval(load, 10_000)
    return () => {
      live = false
      clearInterval(poll)
    }
  }, [token])

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const rows = sys
    ? [
        ['FastAPI uptime', fmtUptime(sys.process_uptime_s + tick)],
        ['Detections stored', sys.detections_rows.toLocaleString()],
        ['Telemetry rows', sys.telemetry_rows.toLocaleString()],
        ['Database size', sys.db_bytes > 1024 * 1024 ? `${(sys.db_bytes / 1048576).toFixed(1)} MB` : `${(sys.db_bytes / 1024).toFixed(1)} KB`],
        ['API Python', sys.python],
      ]
    : []

  return (
    <section className="panel side-panel">
      <header className="panel-head">
        <h2>Runtime</h2>
        <span className="chip">
          <IconDatabase size={11} />
          {sys ? `${sys.journal_mode} · sqlite` : '…'}
        </span>
      </header>
      {error ? (
        <p className="dim-note">Runtime info {error}.</p>
      ) : (
        <div className="runtime">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className="r up-enter"
              style={{ '--d': `${i * 45}ms` }}
            >
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      )}
      <p className="foot-dim">Session token · expires 7 days after sign-in</p>
    </section>
  )
}

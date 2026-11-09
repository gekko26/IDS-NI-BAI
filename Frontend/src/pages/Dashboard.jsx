import { useCallback, useEffect, useRef, useState } from 'react'
import useCountUp from '../hooks/useCountUp.js'
import Hero from '../components/Hero.jsx'
import RuntimePanel from '../components/RuntimePanel.jsx'
import {
  IconActivity,
  IconCheck,
  IconLayers,
  IconLogOut,
  IconShield,
  IconShieldAlert,
} from '../components/Icons.jsx'

const CLASS_LABELS = {
  benign: 'Benign',
  dos: 'Hping3 DoS',
  scan: 'Nmap scan',
  brute_force: 'Hydra brute force',
  arp_spoof: 'Ettercap ARP spoof',
}

const CLASS_ORDER = ['benign', 'dos', 'scan', 'brute_force', 'arp_spoof']

function fmtTs(ts) {
  if (!ts) return '—'
  // 2026-11-09T12:09:14(.…Z) → 2026-11-09 12:09:14Z (UTC)
  return `${ts.slice(0, 10)} ${ts.slice(11, 19)}Z`
}

function ageText(ts) {
  const t = Date.parse(ts)
  if (!Number.isFinite(t)) return '—'
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

function Tile({ kind, icon, label, value, suffix }) {
  const shown = useCountUp(Number(value) || 0, {
    decimals: kind === 'avg' ? 1 : 0,
  })
  return (
    <div className={`stat${kind === 'attacks' ? ' stat-warn' : ''}`}>
      <span className="stat-ico">{icon}</span>
      <div className="k">{label}</div>
      <div className="v">
        {shown}
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </div>
  )
}

function ClassChart({ byClass, total }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Class distribution</h2>
        <span className="panel-hint">{total} windows</span>
      </header>
      <div className="bars">
        {CLASS_ORDER.filter((c) => byClass[c]).map((cls, i) => {
          const count = byClass[cls]
          const pct = Math.round((count / Math.max(total, 1)) * 100)
          return (
            <div key={cls} className="bar-row">
              <span className="bar-label">{CLASS_LABELS[cls]}</span>
              <span className="bar-track">
                <span
                  className={`bar-fill${cls === 'benign' ? ' bar-benign' : ''}`}
                  style={{ width: `${pct}%`, animationDelay: `${i * 90}ms` }}
                />
              </span>
              <span className="bar-count">{count}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const FILTERS = [
  ['all', 'All'],
  ['attacks', 'Attacks'],
  ['benign', 'Benign'],
]

export default function Dashboard({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [, forceTick] = useState(0)
  const [filter, setFilter] = useState('all')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/detections?limit=200', {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!alive.current) return
      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired — sign in again.')
          setTimeout(onLogout, 1500)
        } else {
          setError('Could not load detections.')
        }
        return
      }
      const payload = await res.json()
      if (!alive.current) return
      setData(payload)
      setError('')
      setLastUpdated(Date.now())
    } catch {
      if (alive.current) setError('Could not load detections.')
    } finally {
      if (alive.current) setRefreshing(false)
    }
  }, [user.token, onLogout])

  useEffect(() => {
    load()
    const poll = setInterval(load, 10000)
    const tick = setInterval(() => forceTick((t) => t + 1), 1000)
    return () => {
      clearInterval(poll)
      clearInterval(tick)
    }
  }, [load])

  const summary = data?.summary
  const items = data?.items ?? []
  const sampleRows = items.filter((r) => r.source === 'sample').length
  const avgLatency = items.length
    ? Math.round(
        (items.reduce((acc, r) => acc + (r.latency_ms ?? 0), 0) / items.length) * 10
      ) / 10
    : 0

  const counts = {
    all: items.length,
    attacks: items.filter((r) => r.predicted_class !== 'benign').length,
    benign: items.filter((r) => r.predicted_class === 'benign').length,
  }
  const filtered =
    filter === 'all'
      ? items
      : items.filter((r) =>
          filter === 'attacks'
            ? r.predicted_class !== 'benign'
            : r.predicted_class === 'benign'
        )

  const initial = (user.name?.[0] ?? 'u').toUpperCase()

  return (
    <div className="dash-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <IconShield size={21} />
          <span>IDS Gateway</span>
          <span className="topbar-live">
            <span className="dot live" /> monitoring
          </span>
        </div>
        <div className="topbar-user">
          <span className="avatar">{initial}</span>
          <span className="topbar-name">{user.name}</span>
          <button className="ghost" type="button" onClick={onLogout}>
            <IconLogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        {error ? (
          <div className="login-error shake-enter" role="alert">
            <IconShieldAlert size={17} />
            <p>{error}</p>
          </div>
        ) : summary ? (
          <>
            <Hero
              items={items}
              onRefresh={load}
              refreshing={refreshing}
              lastUpdated={lastUpdated}
            />

            <div className="stats">
              <Tile kind="total" icon={<IconLayers size={17} />} label="Windows analysed" value={summary.total} />
              <Tile kind="attacks" icon={<IconShieldAlert size={17} />} label="Attacks detected" value={summary.attacks} />
              <Tile kind="benign" icon={<IconCheck size={17} />} label="Benign windows" value={summary.benign} />
              <Tile kind="avg" icon={<IconActivity size={17} />} label="Avg inference" value={avgLatency || 0} suffix="ms" />
            </div>

            <div className="cols">
              <div className="col-main">
                <ClassChart byClass={summary.by_class ?? {}} total={summary.total} />

                <section className="panel">
                  <header className="panel-head">
                    <h2>Recent windows</h2>
                    <span className="panel-hint">one row = one 2 s window</span>
                  </header>

                  <div className="segmented" role="tablist" aria-label="Filter detections">
                    {FILTERS.map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={filter === key}
                        className={filter === key ? 'on' : ''}
                        onClick={() => setFilter(key)}
                      >
                        {label}
                        <em>{counts[key]}</em>
                      </button>
                    ))}
                  </div>

                  <div className="tablewrap">
                    <table className="detections">
                      <thead>
                        <tr>
                          <th>Age</th>
                          <th>Classification</th>
                          <th>Confidence</th>
                          <th>Inference</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((row, i) => {
                          const attack = row.predicted_class !== 'benign'
                          return (
                            <tr
                              key={row.id}
                              className="row-in"
                              style={{ animationDelay: `${Math.min(i, 14) * 26}ms` }}
                            >
                              <td className="mono" title={fmtTs(row.ts)}>
                                {ageText(row.ts)}
                              </td>
                              <td>
                                <span className={`badge ${attack ? 'badge-attack' : 'badge-benign'}`}>
                                  {CLASS_LABELS[row.predicted_class] ?? row.predicted_class}
                                </span>
                              </td>
                              <td>
                                <span className="conf">{(row.confidence * 100).toFixed(1)}%</span>
                              </td>
                              <td className="mono">
                                {row.latency_ms != null ? `${row.latency_ms.toFixed(1)} ms` : '—'}
                              </td>
                              <td>{row.source}</td>
                            </tr>
                          )
                        })}
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty">
                              Nothing here in this filter.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  {sampleRows ? (
                    <p className="foot-note">
                      {sampleRows} of these rows are clearly-tagged development samples —
                      real pipeline rows replace them once the detector is wired up.
                    </p>
                  ) : null}
                </section>
              </div>

              <aside className="col-side">
                <RuntimePanel token={user.token} />
              </aside>
            </div>
          </>
        ) : (
          <p className="subtitle">Loading detections…</p>
        )}
      </main>
    </div>
  )
}

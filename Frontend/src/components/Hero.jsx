import { useMemo } from 'react'
import { IconActivity, IconRefresh, IconShieldAlert } from './Icons.jsx'

const MIN = 60_000
const SPAN_MIN = 15 // sparkline covers the last 15 minutes

function agoText(ms) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

// Network-pulse hero: narrative status + a live 15-minute sparkline fed by
// the detections the API actually returned. Nothing here is mock data.
export default function Hero({ items, onRefresh, refreshing, lastUpdated }) {
  const { totals, attacks, peak } = useMemo(() => {
    const nowMs = Date.now()
    const totals = Array(SPAN_MIN).fill(0)
    const attacks = Array(SPAN_MIN).fill(0)
    let lastAttackMs = null
    for (const it of items) {
      const t = Date.parse(it.ts)
      if (!Number.isFinite(t)) continue
      const idx = Math.min(SPAN_MIN - 1, Math.max(0, SPAN_MIN - 1 - Math.floor((nowMs - t) / MIN)))
      if (t >= nowMs - SPAN_MIN * MIN) {
        totals[idx] += 1
        if (it.predicted_class !== 'benign') attacks[idx] += 1
      }
      if (it.predicted_class !== 'benign' && (lastAttackMs === null || t > lastAttackMs)) {
        lastAttackMs = t
      }
    }
    return {
      totals,
      attacks,
      peak: Math.max(1, ...totals),
    }
  }, [items])

  const attacksCount = attacks.reduce((a, b) => a + b, 0)
  const tone = attacksCount > 0 ? 'warn' : 'ok'

  const W = 620
  const H = 104
  const X0 = 10
  const X1 = W - 10
  const BASE = 88
  const TOP = 14
  const x = (i) => X0 + (i * (X1 - X0)) / (SPAN_MIN - 1)
  const y = (v) => BASE - ((v / peak) * (BASE - TOP))

  const path = (arr) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(' ')

  const lastIdx = SPAN_MIN - 1

  return (
    <section className={`band`} data-tone={tone}>
      <div className="band-head">
        <div className="band-intro">
          <span className={`eyebrow tone-${tone}`}>
            <span className="dot" /> live capture
          </span>
          <h1 className="band-title">
            {tone === 'warn' ? 'Threats in the current window' : 'Network overview'}
          </h1>
          <p className="band-sub">
            {tone === 'warn'
              ? `${attacksCount} attack-class detection${attacksCount === 1 ? '' : 's'} in the loaded range — review the recent windows below.`
              : 'No attack-class windows in the loaded range. Everything looks ordinary.'}
          </p>
        </div>
        <div className="dash-meta">
          <span className="updated">
            {refreshing ? 'updating…' : lastUpdated ? `updated ${agoText(Date.now() - lastUpdated)}` : ' '}
          </span>
          <button
            className="icon-btn"
            type="button"
            onClick={onRefresh}
            title="Refresh now"
            aria-label="Refresh now"
          >
            <IconRefresh size={16} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="spark">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="spark-svg" aria-hidden="true">
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((f) => (
            <line
              key={f}
              x1={X0}
              x2={X1}
              y1={TOP + (BASE - TOP) * (1 - f)}
              y2={TOP + (BASE - TOP) * (1 - f)}
              className="spark-grid"
            />
          ))}
          <path d={`${path(totals)} L${X1} ${BASE} L${X0} ${BASE} Z`} className="spark-area" />
          <path d={path(totals)} pathLength="1" className="spark-line" />
          <path d={path(attacks)} pathLength="1" className="spark-line spark-line-attack" />
          {items.length ? (
            <g className="spark-ping" transform={`translate(${x(lastIdx)} ${y(totals[lastIdx])})`}>
              <circle r="10" className="spark-ping-ring" />
              <circle r="3" className="spark-dot" />
              <animate attributeName="opacity" values="1;.7;1" dur="2.2s" repeatCount="indefinite" />
            </g>
          ) : null}
        </svg>
        <div className="spark-axis">
          <span>−{SPAN_MIN}m</span>
          <span className="spark-legend">
            <i className="lg lg-all" /> all windows
            <i className="lg lg-attack" /> attack-class
          </span>
          <span>now</span>
        </div>
      </div>

      <div className="band-foot">
        <span className="muted">
          {items.length
            ? `${items.length} windows shown · peak ${peak}/min in range`
            : 'No windows in the last 15 minutes'}
        </span>
        <span className={`muted ${tone === 'warn' ? 'tone-red' : ''}`}>
          {tone === 'warn' ? (
            <>
              <IconShieldAlert size={13} /> attack activity present
            </>
          ) : (
            <>
              <IconActivity size={13} /> steady state
            </>
          )}
        </span>
      </div>
    </section>
  )
}

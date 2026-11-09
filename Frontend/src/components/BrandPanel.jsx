// Dark brand panel on the login page: a slowly drifting dotted grid, a
// shield that draws itself in, and a small network graph with packets
// travelling edges forever (SMIL animateMotion — no JS ticking).
const EDGES = [
  ['e0', 'M52 64 L138 42'],
  ['e1', 'M138 42 L232 74'],
  ['e2', 'M232 74 L328 52'],
  ['e3', 'M52 64 L96 148'],
  ['e4', 'M96 148 L190 158'],
  ['e5', 'M190 158 L232 74'],
  ['e6', 'M232 74 L296 138'],
  ['e7', 'M296 138 L328 52'],
  ['e8', 'M96 148 L128 236'],
  ['e9', 'M128 236 L226 258'],
  ['e10', 'M226 258 L296 138'],
  ['e11', 'M226 258 L318 292'],
  ['e12', 'M190 158 L226 258'],
  ['e13', 'M128 236 L40 268'],
]

const NODES = [
  [52, 64, 4], [138, 42, 3.2], [232, 74, 4.5], [328, 52, 3], [296, 138, 3.4],
  [190, 158, 4], [96, 148, 3.4], [128, 236, 3.6], [226, 258, 4.5], [318, 292, 2.8],
  [40, 268, 2.8],
]

// key, edge id, duration (s), begin offset (s) — desynchronised on purpose
const PACKETS = [
  ['p0', 'e1', 4.2, 0],
  ['p1', 'e5', 5.6, -2.1],
  ['p2', 'e4', 3.8, -0.9],
  ['p3', 'e6', 4.6, 0],
  ['p4', 'e9', 5.2, -3.4],
  ['p5', 'e3', 4.9, -1.2],
  ['p6', 'e10', 6.1, -2.6],
  ['p7', 'e7', 4.4, -0.5],
]

import { IconActivity, IconDatabase, IconWifi } from './Icons.jsx'

const FEATURES = [
  [IconActivity, '12-feature windowed inference'],
  [IconWifi, '2-second capture windows on br0'],
  [IconDatabase, 'SQLite WAL + Snort baseline'],
]

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <div className="brand-inner">
        <div className="brand-mark brand-enter" style={{ '--d': '0ms' }}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
            <g className="shield-draw">
              <path
                d="M23 6l14 5.5V21c0 9-6 15.5-14 18.5C15 36.5 9 30 9 21V11.5L23 6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                className="shield-draw-late"
                d="M17.5 23l3.6 3.6 7-7.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        <h1 className="brand-title brand-enter" style={{ '--d': '80ms' }}>
          IDS Gateway
        </h1>
        <p className="brand-tag brand-enter" style={{ '--d': '150ms' }}>
          Edge security gateway for small IoT networks — packet capture,
          windowed inference and a live dashboard, on one Raspberry Pi.
        </p>

        <div className="brand-net brand-enter" style={{ '--d': '260ms' }}>
          <svg viewBox="0 0 380 320" className="net-svg" aria-hidden="true">
            {/* faint shield watermark */}
            <path
              className="net-shield"
              d="M190 8l64 25V80c0 62-27 104-64 122-37-18-64-60-64-122V33l64-25z"
            />
            {EDGES.map(([id, d]) => (
              <path key={id} id={id} className="net-edge" d={d} />
            ))}
            {PACKETS.map(([key, edge, dur, begin]) => (
              <circle key={key} r="2.6" className="net-pkt">
                <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${edge}`} />
                </animateMotion>
              </circle>
            ))}
            {NODES.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} className={`net-node${i % 3 === 0 ? ' net-node-hub' : ''}`}>
                {i % 3 === 0 && (
                  <animate
                    attributeName="opacity"
                    values="1;.45;1"
                    dur={`${2.4 + (i % 5) * 0.5}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            ))}
          </svg>
        </div>

        <ul className="brand-feats">
          {FEATURES.map(([Icon, text], i) => (
            <li key={text} className="brand-enter" style={{ '--d': `${380 + i * 110}ms` }}>
              <Icon size={15} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

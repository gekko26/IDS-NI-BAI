// Hand-set inline SVG icon set — single stroke weight (1.8), round caps,
// consistent 24px grid. Kept as JSX so the bundle needs no icon library.
function Svg({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconShield = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M12 3l7 3v5c0 4.4-2.9 8-7 10-4.1-2-7-5.6-7-10V6l7-3z" />
    <path d="M9.5 12l1.8 1.8 3.2-3.6" />
  </Svg>
)

export const IconShieldAlert = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M12 3l7 3v5c0 4.4-2.9 8-7 10-4.1-2-7-5.6-7-10V6l7-3z" />
    <path d="M12 8v4" />
    <path d="M12 15.5v.01" />
  </Svg>
)

export const IconUser = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c.9-3.4 3.7-5 7-5s6.1 1.6 7 5" />
  </Svg>
)

export const IconLock = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2" />
  </Svg>
)

export const IconEye = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
)

export const IconEyeOff = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M4 4l16 16" />
    <path d="M10 5.2A9.8 9.8 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a16.6 16.6 0 0 1-2.7 3.4" />
    <path d="M6.2 6.9A16 16 0 0 0 2.5 12S6 18.2 12 18.2a9.4 9.4 0 0 0 3.6-.7" />
    <path d="M9.9 10.4a2.6 2.6 0 0 0 3.6 3.7" />
  </Svg>
)

export const IconArrowRight = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M5 12h13" />
    <path d="M13 6.5L18.5 12 13 17.5" />
  </Svg>
)

export const IconActivity = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M3 12h3.5l2.5-7 4.5 14 2.6-7H21" />
  </Svg>
)

export const IconCheck = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.2l2.3 2.3 4.7-5" />
  </Svg>
)

export const IconGauge = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M4.5 15.5a8 8 0 1 1 15 0" />
    <path d="M12 12l3.8-3.4" />
    <path d="M12 19v.01" />
  </Svg>
)

export const IconLayers = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M12 3.5l8.5 4.3L12 12 3.5 7.8 12 3.5z" />
    <path d="M20.5 12L12 16.3 3.5 12" />
    <path d="M20.5 16.2L12 20.5 3.5 16.2" />
  </Svg>
)

export const IconRefresh = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M20 11a8 8 0 1 0-1.7 6" />
    <path d="M20 5v6h-6" />
  </Svg>
)

export const IconLogOut = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M14 4.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7" />
    <path d="M17 8.5l3.5 3.5L17 15.5" />
    <path d="M9.5 12h11" />
  </Svg>
)

export const IconDatabase = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <ellipse cx="12" cy="5.8" rx="7" ry="2.8" />
    <path d="M5 5.8v12.4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V5.8" />
    <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
  </Svg>
)

export const IconWifi = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M2.8 9.2a14 14 0 0 1 18.4 0" />
    <path d="M5.9 12.6a9.4 9.4 0 0 1 12.2 0" />
    <path d="M9 16a4.8 4.8 0 0 1 6 0" />
    <path d="M12 19v.01" />
  </Svg>
)

export const IconAlert = ({ size, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M12 4L2.8 19.5h18.4L12 4z" />
    <path d="M12 10v4" />
    <path d="M12 16.8v.01" />
  </Svg>
)

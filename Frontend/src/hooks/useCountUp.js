import { useEffect, useState } from 'react'

// Animated count-up for the dashboard stat tiles (cubic ease-out).
export default function useCountUp(target, { duration = 800, decimals = 0 } = {}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value.toFixed(decimals)
}

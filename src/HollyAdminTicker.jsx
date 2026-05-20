import { useMemo } from 'react'
import { pickRandomHollyMessage } from './adminHollyMessages'

export default function HollyAdminTicker() {
  const message = useMemo(() => pickRandomHollyMessage(), [])

  return (
    <p className="holly-surprise-message" aria-live="polite">
      {message}
    </p>
  )
}

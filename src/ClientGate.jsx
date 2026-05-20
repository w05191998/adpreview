import { useState } from 'react'
import { authenticate, writeAdminSession, writeClientSession } from './clientConfig'
import './ClientGate.css'

export default function ClientGate({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = authenticate(password)
    if (!result) {
      setError('Invalid access code. Please check with your account manager.')
      setIsSubmitting(false)
      return
    }

    if (result.kind === 'admin') {
      writeAdminSession(null, result.adminProfile)
      onAuthenticated({ kind: 'admin', adminProfile: result.adminProfile, activeClient: null })
    } else {
      writeClientSession(result.client)
      onAuthenticated({ kind: 'client', client: result.client })
    }
  }

  return (
    <div className="client-gate">
      <div className="client-gate-card">
        <p className="client-gate-company">HOLLY@FABCOM</p>
        <h1 className="client-gate-title">Meta Ad Preview</h1>
        <p className="client-gate-lead">
          Enter your access code to load branded presets and preview Facebook &amp; Instagram
          feed placements.
        </p>

        <form className="client-gate-form" onSubmit={handleSubmit}>
          <label className="client-gate-label" htmlFor="client-access-code">
            Access code
          </label>
          <div className="client-gate-password">
            <input
              id="client-access-code"
              className="client-gate-input"
              type={showPassword ? 'text' : 'password'}
              name="accessCode"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter access code"
              autoComplete="current-password"
              autoFocus
              required
            />
            <button
              type="button"
              className="client-gate-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide access code' : 'Show access code'}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error ? (
            <p className="client-gate-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="client-gate-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying…' : 'Continue to preview'}
          </button>
        </form>
      </div>
    </div>
  )
}

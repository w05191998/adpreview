import { CLIENTS, listClients, writeAdminSession } from './clientConfig'
import HollyAdminTicker from './HollyAdminTicker'
import './ClientGate.css'

export default function AdminClientPicker({ adminProfile = 'standard', onSelectClient, onLogout }) {
  const clients = listClients()
  const showHollySurprise = adminProfile === 'holly'

  const handleSelect = (clientId) => {
    writeAdminSession(clientId, adminProfile)
    onSelectClient(CLIENTS[clientId])
  }

  return (
    <div className="client-gate">
      <div className="client-gate-admin-stack">
        <div className="client-gate-card client-gate-card--admin">
          <p className="client-gate-admin-label">Admin access</p>
          <h1 className="client-gate-title">Choose a client workspace</h1>
          <p className="client-gate-lead">
            You can switch between any client preset. Each organization&apos;s data stays
            separate.
          </p>

          <ul className="client-gate-picker">
            {clients.map((client) => (
              <li key={client.id}>
                <button
                  type="button"
                  className="client-gate-picker-item"
                  onClick={() => handleSelect(client.id)}
                >
                  {client.brandLogo ? (
                    <img
                      className="client-gate-picker-logo"
                      src={client.brandLogo}
                      alt=""
                    />
                  ) : (
                    <span className="client-gate-picker-fallback" aria-hidden="true">
                      {client.label.charAt(0)}
                    </span>
                  )}
                  <span className="client-gate-picker-name">{client.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="client-gate-secondary" onClick={onLogout}>
            Sign out
          </button>
        </div>

        {showHollySurprise ? <HollyAdminTicker /> : null}
      </div>
    </div>
  )
}

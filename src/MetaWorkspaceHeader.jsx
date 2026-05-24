import { CLIENTS } from './clientConfig'

export default function MetaWorkspaceHeader({
  client,
  isAdmin = false,
  pageTitle,
  activeTool = 'ad-preview',
  onBackToPlatformHub,
  onNavigateMetaTool,
  onSwitchClient,
  onSignOut,
}) {
  const showMetaTools = Boolean(onBackToPlatformHub)

  return (
    <div className="panel-header panel-header--compact panel-header--with-nav">
      <div className="panel-header-brand">
        {client.brandLogo ? (
          <img
            className="panel-client-logo panel-client-logo--header-brand"
            src={client.brandLogo}
            alt={`${client.label} logo`}
          />
        ) : null}
        <h1 className="panel-header-title panel-header-title--brand">{pageTitle}</h1>
      </div>
      <div className="panel-header-actions panel-header-actions--app-nav">
        <span className="panel-nav-item panel-nav-item--brand">{client.label}</span>
        {showMetaTools ? (
          <button type="button" className="panel-nav-item panel-nav-item--link" onClick={onBackToPlatformHub}>
            Platform
          </button>
        ) : null}
        {showMetaTools ? (
          <>
            {activeTool === 'ad-preview' ? (
              <span className="panel-nav-item panel-nav-item--current" aria-current="page">
                Meta Ad Preview
              </span>
            ) : (
              <button
                type="button"
                className="panel-nav-item panel-nav-item--link"
                onClick={() => onNavigateMetaTool?.('ad-preview')}
              >
                Meta Ad Preview
              </button>
            )}
            {activeTool === 'ad-specs' ? (
              <span className="panel-nav-item panel-nav-item--current" aria-current="page">
                Ad Specs
              </span>
            ) : (
              <button
                type="button"
                className="panel-nav-item panel-nav-item--link"
                onClick={() => onNavigateMetaTool?.('ad-specs')}
              >
                Ad Specs
              </button>
            )}
          </>
        ) : (
          <span className="panel-nav-item panel-nav-item--current" aria-current="page">
            Meta Ad Preview
          </span>
        )}
        {isAdmin ? (
          <label className="panel-admin-client">
            <span className="panel-admin-client-label">Client</span>
            <select
              className="panel-admin-client-select"
              value={client.id}
              onChange={(event) => onSwitchClient(CLIENTS[event.target.value])}
            >
              {Object.values(CLIENTS).map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <span className="panel-admin-badge">Admin</span>
          </label>
        ) : null}
        <button type="button" className="panel-logout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}

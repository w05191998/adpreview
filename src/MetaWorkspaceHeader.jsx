import { useEffect, useRef } from 'react'
import { CLIENTS } from './clientConfig'
import './MetaWorkspaceHeader.css'

const META_TOOLS = [
  { id: 'ad-preview', label: 'Meta Ad Preview', shortLabel: 'Preview' },
  { id: 'ad-specs', label: 'Ad Specs', shortLabel: 'Specs' },
]

function ToolTab({ tool, isActive, onSelect }) {
  const label = (
    <>
      <span className="workspace-tool-tab__long">{tool.label}</span>
      <span className="workspace-tool-tab__short">{tool.shortLabel}</span>
    </>
  )

  if (isActive) {
    return (
      <span
        className="workspace-tool-tab workspace-tool-tab--active"
        role="tab"
        aria-selected="true"
        aria-current="page"
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      className="workspace-tool-tab"
      role="tab"
      aria-selected="false"
      onClick={() => onSelect(tool.id)}
    >
      {label}
    </button>
  )
}

export default function MetaWorkspaceHeader({
  client,
  isAdmin = false,
  activeTool = 'ad-preview',
  onBackToPlatformHub,
  onNavigateMetaTool,
  onSwitchClient,
  onSignOut,
}) {
  const showMetaTools = Boolean(onBackToPlatformHub)
  const headerRef = useRef(null)

  useEffect(() => {
    const headerEl = headerRef.current
    const shell =
      headerEl?.closest('.app-shell--with-workspace-header') ??
      document.querySelector('.app-shell--with-workspace-header')

    if (!headerEl || !shell) {
      return undefined
    }

    const measureHeader = () => {
      const height = Math.ceil(headerEl.getBoundingClientRect().height)
      shell.style.setProperty('--workspace-header-offset', `${height}px`)
    }

    measureHeader()
    const resizeObserver = new ResizeObserver(measureHeader)
    resizeObserver.observe(headerEl)
    window.addEventListener('resize', measureHeader)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureHeader)
      shell.style.removeProperty('--workspace-header-offset')
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={[
        'workspace-header',
        showMetaTools ? 'workspace-header--with-tool-tabs' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Workspace navigation"
    >
      <div className="workspace-header__sheet">
        <div className="workspace-header__row">
          <div className="workspace-header__start">
            {showMetaTools ? (
              <button type="button" className="workspace-back" onClick={onBackToPlatformHub}>
                <span className="workspace-back__icon" aria-hidden="true">
                  ←
                </span>
                Platform
              </button>
            ) : null}

            <div className="workspace-brand">
              {client.brandLogo ? (
                <img className="workspace-brand__logo" src={client.brandLogo} alt="" />
              ) : null}
              <div className="workspace-brand__text">
                <h1 className="workspace-brand__name">{client.label}</h1>
                <p className="workspace-brand__context">Meta advertising workspace</p>
              </div>
            </div>
          </div>

          {showMetaTools ? (
            <nav className="workspace-header__tools" aria-label="Meta tools">
              <div className="workspace-tool-tabs" role="tablist">
                {META_TOOLS.map((tool) => (
                  <ToolTab
                    key={tool.id}
                    tool={tool}
                    isActive={activeTool === tool.id}
                    onSelect={(toolId) => onNavigateMetaTool?.(toolId)}
                  />
                ))}
              </div>
            </nav>
          ) : null}

          <div className="workspace-header__end">
            {isAdmin ? (
              <label className="panel-admin-client workspace-header__admin">
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
            <button type="button" className="workspace-signout" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

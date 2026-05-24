import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CLIENTS } from './clientConfig'
import './MetaWorkspaceHeader.css'

const META_TOOLS = [
  { id: 'ad-preview', label: 'Meta Ad Preview', shortLabel: 'Preview' },
  { id: 'ad-specs', label: 'Ad Specs', shortLabel: 'Specs' },
]

function ToolTab({ tool, isActive, onSelect, tabRef }) {
  return (
    <button
      ref={tabRef}
      type="button"
      className={[
        'workspace-tool-tab',
        isActive ? 'workspace-tool-tab--active' : 'ui-interactive',
      ]
        .filter(Boolean)
        .join(' ')}
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={isActive ? 0 : -1}
      onClick={() => {
        if (!isActive) {
          onSelect(tool.id)
        }
      }}
    >
      <span className="workspace-tool-tab__long">{tool.label}</span>
      <span className="workspace-tool-tab__short">{tool.shortLabel}</span>
    </button>
  )
}

function WorkspaceToolTabs({ activeTool, onSelect }) {
  const tablistRef = useRef(null)
  const tabRefs = useRef({})
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: '0px',
    left: '0px',
  })

  const syncIndicator = useCallback(() => {
    const tablist = tablistRef.current
    const activeNode = tabRefs.current[activeTool]
    if (!tablist || !activeNode) {
      return
    }

    const listRect = tablist.getBoundingClientRect()
    const tabRect = activeNode.getBoundingClientRect()
    setIndicatorStyle({
      width: `${tabRect.width}px`,
      left: `${tabRect.left - listRect.left}px`,
    })
  }, [activeTool])

  useLayoutEffect(() => {
    syncIndicator()

    const tablist = tablistRef.current
    if (!tablist) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(syncIndicator)
    resizeObserver.observe(tablist)
    window.addEventListener('resize', syncIndicator)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncIndicator)
    }
  }, [syncIndicator])

  return (
    <div className="workspace-tool-tabs" role="tablist" ref={tablistRef}>
      <span
        className="workspace-tool-tabs__indicator"
        style={indicatorStyle}
        aria-hidden="true"
      />
      {META_TOOLS.map((tool) => (
        <ToolTab
          key={tool.id}
          tool={tool}
          isActive={activeTool === tool.id}
          onSelect={onSelect}
          tabRef={(node) => {
            tabRefs.current[tool.id] = node
          }}
        />
      ))}
    </div>
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
        showMetaTools && isAdmin ? 'workspace-header--admin' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Workspace navigation"
    >
      <div className="workspace-header__sheet">
        <div className="workspace-header__row">
          <div className="workspace-header__start">
            {showMetaTools ? (
              <button
                type="button"
                className="workspace-back ui-interactive"
                onClick={onBackToPlatformHub}
              >
                <span className="workspace-back__icon" aria-hidden="true">
                  ←
                </span>
                <span className="workspace-back__label">Platform</span>
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
              <WorkspaceToolTabs activeTool={activeTool} onSelect={onNavigateMetaTool} />
            </nav>
          ) : null}

          <div className="workspace-header__end">
            {isAdmin ? (
              <label className="panel-admin-client workspace-header__admin">
                <span className="panel-admin-client-label">Client</span>
                <select
                  className="panel-admin-client-select app-select"
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
            <button type="button" className="workspace-signout ui-interactive" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

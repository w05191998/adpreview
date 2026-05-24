import { useState } from 'react'
import './LaneCrawfordPlatformHub.css'

const PLATFORMS = [
  { id: 'meta', label: 'Meta' },
  { id: 'programmatic', label: 'Programmatic' },
  { id: 'google-ads', label: 'Google Ads' },
]

const PLATFORM_CONTENT = {
  meta: {
    subPages: [
      { id: 'ad-preview', label: 'Ad Preview', description: 'Facebook & Instagram feed placements' },
      {
        id: 'ad-specs',
        label: 'Ad Specs',
        description: 'Meta creative specs and format requirements',
      },
    ],
  },
  programmatic: {
    subPages: [],
  },
  'google-ads': {
    subPages: [],
  },
}

const COMING_SOON_TITLE = 'Coming soon'

export default function LaneCrawfordPlatformHub({
  client,
  isAdmin = false,
  onOpenMetaPreview,
  onOpenAdSpecs,
  onLogout,
}) {
  const [platform, setPlatform] = useState('meta')

  const activePlatform = PLATFORMS.find((entry) => entry.id === platform) || PLATFORMS[0]
  const { subPages } = PLATFORM_CONTENT[activePlatform.id]
  const showComingSoonOnly = subPages.length === 0

  const handleSubPageClick = (subPage) => {
    if (activePlatform.id !== 'meta' || subPage.comingSoon) {
      return
    }

    if (subPage.id === 'ad-preview') {
      onOpenMetaPreview()
    }

    if (subPage.id === 'ad-specs') {
      onOpenAdSpecs()
    }
  }

  return (
    <div className="lc-platform-hub">
      <div className="lc-platform-hub-card">
        <header className="lc-platform-hub-header">
          {client.brandLogo ? (
            <img className="lc-platform-hub-logo" src={client.brandLogo} alt="" />
          ) : null}
          <p className="lc-platform-hub-brand-name">Lane Crawford</p>
          <div className="lc-platform-hub-header-actions">
            {isAdmin ? <span className="lc-platform-hub-admin-badge">Admin</span> : null}
            <button type="button" className="lc-platform-hub-logout" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </header>

        <div className="lc-platform-hub-form">
          <label className="lc-platform-hub-field">
            <span>Platform</span>
            <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
              {PLATFORMS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="lc-platform-hub-tools">
          <span className="lc-platform-hub-tools-label">Tools</span>
          <ul className="lc-platform-hub-subpages">
            {showComingSoonOnly ? (
              <li>
                <div className="lc-platform-hub-subpage lc-platform-hub-subpage--static">
                  <strong>{COMING_SOON_TITLE}</strong>
                </div>
              </li>
            ) : (
              subPages.map((subPage) => (
                <li key={subPage.id}>
                  {subPage.comingSoon ? (
                    <div className="lc-platform-hub-subpage lc-platform-hub-subpage--static">
                      <span className="lc-platform-hub-subpage-row">
                        <strong>{subPage.label}</strong>
                        {subPage.description ? (
                          <span className="lc-platform-hub-subpage-desc">{subPage.description}</span>
                        ) : null}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="lc-platform-hub-subpage lc-platform-hub-subpage--action"
                      onClick={() => handleSubPageClick(subPage)}
                    >
                      <span className="lc-platform-hub-subpage-row">
                        <strong>{subPage.label}</strong>
                        {subPage.description ? (
                          <span className="lc-platform-hub-subpage-desc">{subPage.description}</span>
                        ) : null}
                      </span>
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

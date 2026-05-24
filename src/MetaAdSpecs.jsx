import { useEffect, useState } from 'react'
import {
  AppstoreOutlined,
  FolderOpenOutlined,
  PictureOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import MetaWorkspaceHeader from './MetaWorkspaceHeader'
import {
  META_AD_SPECS_SOURCES,
  META_FEED_COMPARISON_ROWS,
  META_FEED_FORMAT_DETAILS,
} from './metaAdSpecsData'
import './MetaAdSpecs.css'

const FORMAT_COLUMNS = [
  { id: 'image', label: 'Image', Icon: PictureOutlined },
  { id: 'video', label: 'Video', Icon: PlayCircleOutlined },
  { id: 'carousel', label: 'Carousel', Icon: AppstoreOutlined },
  { id: 'collection', label: 'Collection', Icon: FolderOpenOutlined },
]

function FormatColumnHeader({ formatId, label, Icon, onJumpToDetails }) {
  return (
    <div className="meta-ad-specs-format-header">
      <span>{label}</span>
      <button
        type="button"
        className="meta-ad-specs-format-jump"
        onClick={() => onJumpToDetails(formatId)}
        aria-label={`View ${label} detailed specifications`}
        title={`Jump to ${label} details`}
      >
        <Icon aria-hidden="true" />
      </button>
    </div>
  )
}

function ComparisonTable({ onJumpToDetails }) {
  return (
    <div className="meta-ad-specs-table-wrap meta-ad-specs-table-wrap--comparison">
      <table className="meta-ad-specs-table meta-ad-specs-table--comparison">
        <thead>
          <tr>
            <th scope="col">Specification</th>
            {FORMAT_COLUMNS.map((column) => (
              <th key={column.id} scope="col">
                <FormatColumnHeader
                  formatId={column.id}
                  label={column.label}
                  Icon={column.Icon}
                  onJumpToDetails={onJumpToDetails}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {META_FEED_COMPARISON_ROWS.map((row) => (
            <tr key={row.spec}>
              <th scope="row">{row.spec}</th>
              <td>{row.image}</td>
              <td>{row.video}</td>
              <td>{row.carousel}</td>
              <td>{row.collection}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const EMPHASIZED_DETAIL_LABELS = new Set([
  'Ratio',
  'Resolution',
  'Primary text',
  'Headline',
  'Description',
  'Landing page URL',
  'Maximum file size',
  'Video duration',
  'Number of carousel cards',
  'Instant Experience',
  'File type',
  'Image file type',
  'Video file type',
  'Video settings',
  'Minimum width',
  'Minimum height',
  'Cover media',
])

function DetailSectionTable({ rows }) {
  return (
    <div className="meta-ad-specs-table-wrap">
      <table className="meta-ad-specs-table meta-ad-specs-table--detail">
        <tbody>
          {rows.map((row) => {
            const emphasize = row.emphasize ?? EMPHASIZED_DETAIL_LABELS.has(row.label)

            return (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className={emphasize ? 'meta-ad-specs-value--emphasis' : undefined}>{row.value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const HIGHLIGHT_DURATION_MS = 4500

export default function MetaAdSpecs({
  embedded = false,
  client,
  isAdmin = false,
  onBackToPlatformHub,
  onNavigateMetaTool,
  onSwitchClient,
  onLogout,
}) {
  const [highlightedFormatId, setHighlightedFormatId] = useState(null)

  useEffect(() => {
    if (!highlightedFormatId) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setHighlightedFormatId(null)
    }, HIGHLIGHT_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [highlightedFormatId])

  const jumpToFormatDetails = (formatId) => {
    setHighlightedFormatId(formatId)
    const target = document.getElementById(`format-${formatId}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const specsPanels = (
    <>
      <section className="builder-panel meta-ad-specs-panel">
        <header className="meta-ad-specs-intro">
          <h2 className="meta-ad-specs-heading">Meta Ad Specifications</h2>
          <p className="meta-ad-specs-lead">
            Consolidated creative specs for Image, Video, Carousel, and Collection ads on Facebook
            Feed. Values are sourced from the official Meta Ads Guide (Awareness objective).
          </p>
        </header>

        <section className="meta-ad-specs-section meta-ad-specs-section--comparison">
          <h3 className="meta-ad-specs-section-title">Format Comparison</h3>
          <ComparisonTable onJumpToDetails={jumpToFormatDetails} />
        </section>
      </section>

      <section
        className="preview-panel meta-ad-specs-details-panel"
        aria-label="Format specification details"
      >
        {META_FEED_FORMAT_DETAILS.map((format) => (
          <section
            key={format.id}
            className={[
              'meta-ad-specs-section',
              'meta-ad-specs-section--format-detail',
              highlightedFormatId === format.id ? 'meta-ad-specs-section--highlighted' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            id={`format-${format.id}`}
          >
            <div className="meta-ad-specs-section-head">
              <h3 className="meta-ad-specs-section-title">{format.title}</h3>
              <a
                className="meta-ad-specs-source-link"
                href={format.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Meta Ads Guide
              </a>
            </div>
            {format.sections.map((section) => (
              <div key={section.title} className="meta-ad-specs-subsection">
                <h4 className="meta-ad-specs-subsection-title">{section.title}</h4>
                <DetailSectionTable rows={section.rows} />
              </div>
            ))}
          </section>
        ))}

        <footer className="meta-ad-specs-sources">
          <h3 className="meta-ad-specs-section-title">Sources</h3>
          <ul className="meta-ad-specs-sources-list">
            {META_AD_SPECS_SOURCES.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.format} — Facebook Feed specs
                </a>
              </li>
            ))}
          </ul>
          <p className="meta-ad-specs-disclaimer">
            All ads must comply with Meta Advertising Policies. Specifications may vary by
            objective, placement, and region.
          </p>
        </footer>
      </section>
    </>
  )

  if (embedded) {
    return specsPanels
  }

  return (
    <main className="app-shell app-shell--ad-specs app-shell--with-workspace-header">
      <MetaWorkspaceHeader
        client={client}
        isAdmin={isAdmin}
        activeTool="ad-specs"
        onBackToPlatformHub={onBackToPlatformHub}
        onNavigateMetaTool={onNavigateMetaTool}
        onSwitchClient={onSwitchClient}
        onSignOut={onLogout}
      />
      {specsPanels}
    </main>
  )
}

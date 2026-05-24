import { LinkOutlined, WhatsAppOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import AdminClientPicker from './AdminClientPicker'
import ClientGate from './ClientGate'
import LaneCrawfordPlatformHub from './LaneCrawfordPlatformHub'
import MetaAdSpecs from './MetaAdSpecs'
import MetaWorkspaceHeader from './MetaWorkspaceHeader'
import {
  CLIENTS,
  buildDefaultForm,
  clientUsesPlatformHub,
  getFacebookBrandName,
  getInstagramBrandHandle,
  clearAllStoredDrafts,
  clearClientSession,
  getDraftStorageKey,
  listClients,
  readSession,
  writeAdminSession,
} from './clientConfig'
import FieldCharCounter from './FieldCharCounter'
import { META_AD_HARD_LIMITS } from './metaAdLimits'
import './App.css'

const CREATIVE_TYPE = {
  image: 'Single Image',
  video: 'Single Video',
  carousel: 'Carousel',
}

const MEDIA_RATIOS = [
  { key: '1:1', label: 'Square (1:1)', cssValue: '1 / 1' },
  { key: '4:5', label: 'Portrait (4:5)', cssValue: '4 / 5' },
  { key: '9:16', label: 'Story/Reel (9:16)', cssValue: '9 / 16' },
]

function formatIgCtaLabel(label) {
  const trimmed = (label || '').trim()
  if (!trimmed) {
    return ''
  }

  if (trimmed === WHATSAPP_CTA_LABEL) {
    return 'WhatsApp'
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

const CAMPAIGN_OBJECTIVE_OPTIONS = ['Reach', 'Traffic', 'Engagement', 'Conversion']

const FACEBOOK_CTA_OPTIONS = [
  'Book now',
  'Get offer',
  'Learn more',
  'Order now',
  'Send WhatsApp Message',
  'Shop now',
  'Sign up',
]

const INITIAL_FORM = {
  campaignName: '',
  pageName: '',
  campaignObjective: '',
  primaryText: '',
  headline: '',
  description: '',
  ctaLabel: '',
  destinationUrl: '',
  displayUrl: '',
}

function getOpenableUrl(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

const SHOW_SUBMIT_SECTION = false

const MAX_STORED_MEDIA_BYTES = 4 * 1024 * 1024 * 1024

/** Broad list for carousel; video-only upload uses no accept filter so Downloads files without .mp4 still appear. */
const VIDEO_FILE_ACCEPT =
  'video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi,.mpeg,.mpg,.wmv,.3gp,.MP4,.MOV,.M4V,.WEBM,.MKV'

function isVideoFile(file) {
  if (file.type.startsWith('video/')) {
    return true
  }

  if (file.type === 'application/mp4' || file.type === 'application/x-mpegURL') {
    return true
  }

  return /\.(mp4|mov|m4v|webm|mkv|avi|mpeg|mpg|mpe|wmv|3gp)$/i.test(file.name)
}

async function looksLikeVideoFile(file) {
  if (isVideoFile(file)) {
    return true
  }

  try {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (header.length < 8) {
      return false
    }
    const boxType = String.fromCharCode(header[4], header[5], header[6], header[7])
    return boxType === 'ftyp' || boxType === 'moov' || boxType === 'mdat' || boxType === 'wide'
  } catch {
    return false
  }
}

function getMediaFileAccept(creativeType) {
  if (creativeType === 'carousel') {
    return `image/*,${VIDEO_FILE_ACCEPT}`
  }
  if (creativeType === 'video') {
    return undefined
  }
  return 'image/*'
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function readStoredDraft(storageKey) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function writeStoredDraft(storageKey, draft) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(draft))
  } catch {
    // Ignore quota or privacy errors.
  }
}

function hydrateForm(savedForm) {
  const next = { ...INITIAL_FORM }

  if (!savedForm || typeof savedForm !== 'object') {
    return next
  }

  for (const key of Object.keys(INITIAL_FORM)) {
    if (typeof savedForm[key] === 'string') {
      next[key] = savedForm[key]
    }
  }

  return next
}

const LANE_CRAWFORD_LEGACY_DESTINATION_URL = 'https://www.lanecrawford.com/'
const LANE_CRAWFORD_LEGACY_DISPLAY_URL = 'lanecrawford.com'

function resolveInitialDisplayUrl(client, defaults, savedForm, hydrated) {
  const hydratedValue = hydrated.displayUrl.trim()

  if (client.id !== 'laneCrawford') {
    return hydratedValue || defaults.displayUrl
  }

  if (hydratedValue === LANE_CRAWFORD_LEGACY_DISPLAY_URL) {
    return defaults.displayUrl
  }

  if (savedForm && typeof savedForm === 'object' && typeof savedForm.displayUrl === 'string') {
    return savedForm.displayUrl.trim()
  }

  return defaults.displayUrl
}

function isClientDefaultDestinationUrl(client, destinationUrl) {
  const normalized = destinationUrl.trim()
  return Boolean(normalized && normalized === client.defaultDestinationUrl.trim())
}

function createInitialForm(client, savedForm) {
  const defaults = buildDefaultForm(client)
  const hydrated = hydrateForm(savedForm)
  const savedDestinationUrl = hydrated.destinationUrl.trim()
  const destinationUrl =
    savedDestinationUrl &&
    !(
      client.id === 'laneCrawford' && savedDestinationUrl === LANE_CRAWFORD_LEGACY_DESTINATION_URL
    )
      ? savedDestinationUrl
      : defaults.destinationUrl

  return {
    ...defaults,
    ...hydrated,
    pageName: hydrated.pageName.trim() || defaults.pageName,
    displayUrl: resolveInitialDisplayUrl(client, defaults, savedForm, hydrated),
    destinationUrl,
  }
}

function getInitialCreativeType(storedDraft) {
  const value = storedDraft?.creativeType
  return value && CREATIVE_TYPE[value] ? value : 'image'
}

function getInitialMediaRatio(storedDraft) {
  const key = storedDraft?.mediaRatioKey
  return MEDIA_RATIOS.find((ratio) => ratio.key === key) || MEDIA_RATIOS[0]
}

const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
const URL_TEST_PATTERN = /^(https?:\/\/|www\.)/i

const META_PRIMARY_TEXT_CLAMP = 125
const IG_CAPTION_CLAMP = 125
const IG_COLLAPSED_LINE_CHARS = [20, 11]

const WHATSAPP_CTA_LABEL = 'Send WhatsApp Message'

function WhatsAppIcon() {
  return <WhatsAppOutlined className="cta-whatsapp-icon" aria-hidden="true" />
}

function CtaButton({ label }) {
  const ctaLabel = (label || '').trim()

  if (!ctaLabel) {
    return null
  }

  if (ctaLabel === WHATSAPP_CTA_LABEL) {
    return (
      <button type="button" className="cta-button cta-button--whatsapp" aria-label="WhatsApp">
        <WhatsAppIcon />
        <span className="cta-whatsapp-label">WhatsApp</span>
      </button>
    )
  }

  return (
    <button type="button" className="cta-button">
      {ctaLabel}
    </button>
  )
}

function FbLikeIcon() {
  return (
    <svg
      className="fb-engagement-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 8H14.39L15.51 4.63C15.71 4.02 15.61 3.35 15.24 2.83C14.86 2.31 14.26 2 13.62 2H12.01C11.71 2 11.43 2.13 11.24 2.36L6.54 8H4.01C2.91 8 2.01 8.9 2.01 10V19C2.01 20.1 2.91 21 4.01 21H17.32C17.7269 20.9993 18.124 20.8745 18.4581 20.6422C18.7922 20.4099 19.0476 20.0812 19.19 19.7L21.95 12.35C21.99 12.24 22.01 12.12 22.01 12V10C22.01 8.9 21.11 8 20.01 8H20ZM6 19H4V10H6V19ZM20 11.82L17.31 19H8V9.36L12.47 4H13.62L12.06 8.68C12.0114 8.83062 11.9989 8.99054 12.0235 9.14688C12.048 9.30322 12.109 9.4516 12.2015 9.58005C12.2939 9.7085 12.4152 9.81343 12.5557 9.88637C12.6961 9.95932 12.8518 9.99824 13.01 10H20.01V11.82H20Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FbCommentIcon() {
  return (
    <svg
      className="fb-engagement-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36627 17.0887 3.68508 15.4442C3.00389 13.7996 2.82566 11.99 3.17293 10.2442C3.5202 8.49836 4.37737 6.89471 5.63604 5.63604C6.89471 4.37737 8.49836 3.5202 10.2442 3.17293C11.99 2.82567 13.7996 3.0039 15.4442 3.68508C17.0887 4.36627 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 13.488 20.64 14.891 20 16.127L21 21L16.127 20C14.891 20.64 13.487 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FbShareIcon() {
  return (
    <svg
      className="fb-engagement-icon fb-engagement-icon--share"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.114 1.13417C8.19 0.339167 9.02 -0.315833 9.857 0.162167C11.597 1.18117 13.239 2.34217 14.827 3.58317C16.787 5.13117 18.36 6.59017 19.474 7.75517C19.957 8.26217 19.912 9.06317 19.45 9.54717C18.3469 10.6883 17.1801 11.7661 15.955 12.7752C14.017 14.3622 12.01 15.9002 9.825 17.1332C9.084 17.5512 8.281 17.0732 8.138 16.3322L8.121 16.2192L7.894 12.6452C6.078 12.6832 4.32 13.3072 2.914 14.4682L2.649 14.6902L2.521 14.7942L2.274 14.9862L2.154 15.0742L1.924 15.2342C1.8525 15.281 1.77981 15.326 1.706 15.3692L1.5 15.4802C0.534 15.9572 0 15.5352 0 13.6432C0 9.23917 3.245 5.32017 7.632 4.72617L7.891 4.69517L8.114 1.13417ZM10.023 2.60817L9.831 6.08017C9.82452 6.19886 9.77597 6.31135 9.69405 6.39748C9.61213 6.48361 9.50221 6.53774 9.384 6.55017L8.023 6.69217C4.958 7.05817 2.526 9.45417 2.075 12.5862C3.57399 11.4808 5.35312 10.8183 7.21 10.6742L7.607 10.6512L9.311 10.6152C9.44061 10.6124 9.56625 10.66 9.6614 10.7481C9.75654 10.8362 9.81377 10.9577 9.821 11.0872L10.018 14.6832C11.621 13.6622 13.149 12.4872 14.682 11.2332C15.6718 10.4104 16.6251 9.54454 17.539 8.63817L17.281 8.38217L16.725 7.84917C15.7195 6.90693 14.6738 6.00843 13.591 5.15617C12.4428 4.2506 11.2522 3.40031 10.023 2.60817Z"
        fill="currentColor"
      />
    </svg>
  )
}

const FB_ENGAGEMENT_ACTIONS = [
  { key: 'like', label: 'Like', Icon: FbLikeIcon },
  { key: 'comment', label: 'Comment', Icon: FbCommentIcon },
  { key: 'share', label: 'Share', Icon: FbShareIcon },
]

function FbEngagementBar() {
  return (
    <div className="fb-engagement" aria-hidden="true">
      {FB_ENGAGEMENT_ACTIONS.map(({ key, label, Icon }) => (
        <div key={key} className="fb-engagement-action" role="presentation">
          <Icon />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function IgHeartIcon() {
  return (
    <svg
      className="ig-icon-svg ig-icon-svg--filled"
      aria-label="Like"
      role="img"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
    >
      <title>Like</title>
      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" />
    </svg>
  )
}

function IgCommentIcon() {
  return (
    <svg
      className="ig-icon-svg"
      aria-label="Comment"
      role="img"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
    >
      <title>Comment</title>
      <path
        d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IgShareIcon() {
  return (
    <svg
      className="ig-icon-svg"
      aria-label="Share"
      role="img"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
    >
      <title>Share</title>
      <path
        d="M13.973 20.046 21.77 6.928C22.8 5.195 21.55 3 19.535 3H4.466C2.138 3 .984 5.825 2.646 7.456l4.842 4.752 1.723 7.121c.548 2.266 3.571 2.721 4.762.717Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <line
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        x1="7.488"
        x2="15.515"
        y1="12.208"
        y2="7.641"
      />
    </svg>
  )
}

function IgBookmarkIcon() {
  return (
    <svg
      className="ig-icon-svg"
      aria-label="Save"
      role="img"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
    >
      <title>Save</title>
      <polygon
        fill="none"
        points="20 21 12 13.44 4 21 4 3 20 3 20 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

const IG_ENGAGEMENT_LEFT_ACTIONS = [
  { key: 'like', Icon: IgHeartIcon },
  { key: 'comment', Icon: IgCommentIcon },
  { key: 'share', Icon: IgShareIcon },
]

function IgEngagementBar() {
  return (
    <div className="ig-engagement" aria-hidden="true">
      <div className="ig-engagement-left">
        {IG_ENGAGEMENT_LEFT_ACTIONS.map(({ key, Icon }) => (
          <div key={key} className="ig-engagement-action" role="presentation">
            <Icon />
          </div>
        ))}
      </div>
      <div className="ig-engagement-action ig-engagement-save" role="presentation">
        <IgBookmarkIcon />
      </div>
    </div>
  )
}

function IgCtaStrip({ label }) {
  const ctaLabel = formatIgCtaLabel(label)

  if (!ctaLabel) {
    return null
  }

  return (
    <div className="ig-cta-strip" role="presentation">
      <span className="ig-cta-strip-label">{ctaLabel}</span>
      <span className="ig-cta-strip-chevron" aria-hidden="true">
        &gt;
      </span>
    </div>
  )
}

function PageAvatar({ pageName, brandLogos, defaultLogoUrl = '' }) {
  const normalizedName = pageName.trim()
  const logoUrl = brandLogos[normalizedName] || defaultLogoUrl
  const altLabel = normalizedName || 'Trinity Medical Centre'

  if (logoUrl) {
    return <img className="avatar avatar--brand" src={logoUrl} alt={`${altLabel} logo`} />
  }

  return (
    <div className="avatar avatar--fallback" aria-hidden="true">
      {normalizedName.charAt(0) || '?'}
    </div>
  )
}

function truncatePrimaryText(text, maxLength) {
  if (text.length <= maxLength) {
    return text
  }
  const slice = text.slice(0, maxLength)
  const lastBreak = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '))
  return (lastBreak > 40 ? slice.slice(0, lastBreak) : slice).trimEnd()
}

function normalizeIgCaptionText(text) {
  return text.replace(/\r\n/g, '\n').trim()
}

function splitIgCaptionLines(text) {
  return normalizeIgCaptionText(text).split('\n')
}

function getIgCollapsedCaptionLines(text, clampLength) {
  const normalizedText = normalizeIgCaptionText(text)
  const explicitLines = normalizedText.split('\n')

  if (explicitLines.length >= 2) {
    const firstLine = explicitLines[0]
    const secondLine = truncatePrimaryText(explicitLines[1], IG_COLLAPSED_LINE_CHARS[1])
    const hasMore =
      normalizedText.length > clampLength ||
      explicitLines.length > 2 ||
      explicitLines[1].length > secondLine.length

    return {
      lines: [firstLine, secondLine].filter((line) => line.length > 0),
      hasMore,
    }
  }

  const firstLine = truncatePrimaryText(normalizedText, IG_COLLAPSED_LINE_CHARS[0])
  const remainder = normalizedText.slice(firstLine.length).trimStart()
  const secondLine = truncatePrimaryText(remainder, IG_COLLAPSED_LINE_CHARS[1])
  const hasMore = normalizedText.length > clampLength || remainder.length > secondLine.length

  return {
    lines: [firstLine, secondLine].filter((line) => line.length > 0),
    hasMore,
  }
}

function renderTextLineContent(line, lineIndex) {
  const segments = line.split(URL_SPLIT_PATTERN).filter(Boolean)
  return (
    <span key={lineIndex}>
      {segments.map((segment, segmentIndex) => {
        if (URL_TEST_PATTERN.test(segment)) {
          const href = segment.startsWith('http') ? segment : `https://${segment}`
          return (
            <a key={segmentIndex} href={href} target="_blank" rel="noreferrer">
              {segment}
            </a>
          )
        }
        return <span key={segmentIndex}>{segment}</span>
      })}
    </span>
  )
}

function getIgCaptionLineClass(line) {
  if (line.length === 0) {
    return 'ig-caption-line ig-caption-line--gap'
  }

  if (/^(✅|📍|💳|🕒|👉|💬|🔗|💰|🙋‍♀️|💁‍♀️|🔰)/.test(line)) {
    return 'ig-caption-line ig-caption-line--item'
  }

  return 'ig-caption-line'
}

function getIgCaptionDisplayLines({ text, headline, expanded, clampLength }) {
  const normalizedText = normalizeIgCaptionText(text)
  const normalizedHeadline = headline.trim()

  if (expanded) {
    const lines = []
    if (normalizedHeadline) {
      lines.push(normalizedHeadline)
    }
    if (normalizedText) {
      lines.push(...splitIgCaptionLines(text))
    }

    return {
      lines,
      hasMore: false,
      shouldClamp:
        normalizedText.length > clampLength ||
        normalizedText.includes('\n') ||
        normalizedHeadline.length > IG_COLLAPSED_LINE_CHARS[0],
    }
  }

  if (normalizedHeadline && !normalizedText) {
    const line = truncatePrimaryText(normalizedHeadline, IG_COLLAPSED_LINE_CHARS[0])
    return {
      lines: [line],
      hasMore: normalizedHeadline.length > line.length,
      shouldClamp: normalizedHeadline.length > clampLength,
    }
  }

  if (normalizedHeadline && normalizedText) {
    const headlineLine = truncatePrimaryText(normalizedHeadline, IG_COLLAPSED_LINE_CHARS[0])
    const collapsedPrimary = getIgCollapsedCaptionLines(normalizedText, clampLength)
    return {
      lines: [headlineLine, ...collapsedPrimary.lines].filter((line) => line.length > 0),
      hasMore:
        normalizedHeadline.length > headlineLine.length || collapsedPrimary.hasMore,
      shouldClamp:
        normalizedText.length > clampLength ||
        normalizedText.includes('\n') ||
        normalizedHeadline.length > headlineLine.length,
    }
  }

  const collapsedCaption = getIgCollapsedCaptionLines(normalizedText, clampLength)
  return {
    lines: collapsedCaption.lines,
    hasMore: collapsedCaption.hasMore,
    shouldClamp: normalizedText.length > clampLength || normalizedText.includes('\n'),
  }
}

function IgCaptionPreview({ username, text, headline = '', clampLength = IG_CAPTION_CLAMP }) {
  const [expanded, setExpanded] = useState(false)
  const normalizedText = normalizeIgCaptionText(text)
  const normalizedHeadline = headline.trim()
  const normalizedUsername = username.trim()

  useEffect(() => {
    setExpanded(false)
  }, [normalizedText, normalizedHeadline])

  if (!normalizedText && !normalizedHeadline && !normalizedUsername) {
    return null
  }

  if (!normalizedText && !normalizedHeadline) {
    return (
      <div className="ig-caption-body ig-caption-body--collapsed">
        <p className="ig-caption-line">
          <strong className="ig-caption-user">{normalizedUsername}</strong>
        </p>
      </div>
    )
  }

  const { lines, hasMore, shouldClamp } = getIgCaptionDisplayLines({
    text,
    headline,
    expanded,
    clampLength,
  })

  return (
    <div
      className={
        expanded ? 'ig-caption-body ig-caption-body--expanded' : 'ig-caption-body ig-caption-body--collapsed'
      }
    >
      {lines.map((line, lineIndex) => (
        <p key={lineIndex} className={getIgCaptionLineClass(line)}>
          {lineIndex === 0 && normalizedUsername ? (
            <>
              <strong className="ig-caption-user">{normalizedUsername}</strong>
              {line.length > 0 ? ' ' : null}
            </>
          ) : null}
          {line.length > 0 ? renderTextLineContent(line, lineIndex) : null}
          {!expanded && hasMore && lineIndex === lines.length - 1 ? (
            <>
              {'... '}
              <button type="button" className="ig-see-more" onClick={() => setExpanded(true)}>
                more
              </button>
            </>
          ) : null}
        </p>
      ))}
      {expanded && shouldClamp ? (
        <button type="button" className="ig-see-more ig-see-more--standalone" onClick={() => setExpanded(false)}>
          less
        </button>
      ) : null}
    </div>
  )
}

function PrimaryTextPreview({
  text,
  clampLength = META_PRIMARY_TEXT_CLAMP,
  moreLabel = 'See more',
  lessLabel = 'See less',
  ellipsisBeforeMore = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const normalizedText = text.trim()

  if (!normalizedText) {
    return null
  }

  const effectiveClamp = clampLength == null ? Number.POSITIVE_INFINITY : clampLength
  const shouldClamp = normalizedText.length > effectiveClamp
  const visibleText =
    expanded || !shouldClamp
      ? normalizedText
      : truncatePrimaryText(normalizedText, effectiveClamp)

  const lines = visibleText.split('\n')

  return (
    <div className="primary-copy-block">
      <div className="primary-copy">
        {lines.map((line, lineIndex) => (
          <p key={lineIndex} className={line.length === 0 ? 'primary-copy-gap' : undefined}>
            {line.length === 0 ? '\u00a0' : renderTextLineContent(line, lineIndex)}
            {!expanded && shouldClamp && lineIndex === lines.length - 1 ? (
              <>
                {ellipsisBeforeMore ? '... ' : ' '}
                <button type="button" className="see-more" onClick={() => setExpanded(true)}>
                  {moreLabel}
                </button>
              </>
            ) : null}
          </p>
        ))}
      </div>
      {expanded && shouldClamp ? (
        <button
          type="button"
          className="see-more see-more-standalone"
          onClick={() => setExpanded(false)}
        >
          {lessLabel}
        </button>
      ) : null}
    </div>
  )
}

const PLACEMENT_NOTES = {
  carousel:
    'Carousel supports 2-10 cards. Mixed image/video is allowed; keep a consistent ratio across cards.',
  reels:
    'Video upload shows all files in the picker (including Downloads). MPEG-4 files without a .mp4 extension are supported. Files up to 4 GB can be previewed; very large files may not persist in the browser after sign-out due to storage limits.',
}

const getFileKind = (file) => {
  if (isVideoFile(file)) {
    return 'video'
  }
  return 'image'
}

const fileToBase64 = async (file) => {
  const buffer = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function base64ToFile(base64Data, fileName, mimeType) {
  const binary = atob(base64Data)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new File([bytes], fileName, { type: mimeType || 'application/octet-stream' })
}

function storedAssetToFile(asset) {
  if (!asset?.base64Data || !asset?.fileName) {
    return null
  }

  try {
    return base64ToFile(asset.base64Data, asset.fileName, asset.mimeType)
  } catch {
    return null
  }
}

async function fileToStoredAsset(file) {
  if (!file || file.size > MAX_STORED_MEDIA_BYTES) {
    return null
  }

  return {
    fileName: file.name,
    mimeType: file.type,
    kind: getFileKind(file),
    base64Data: await fileToBase64(file),
  }
}

function createCarouselItemFromFile(file, index, copy = {}) {
  return {
    id: `${file.name}-${index}-${Date.now()}`,
    kind: getFileKind(file),
    name: file.name,
    file,
    url: URL.createObjectURL(file),
    headline: copy.headline || '',
    description: copy.description || '',
  }
}

function createCarouselItemsFromAssets(assets) {
  if (!Array.isArray(assets)) {
    return []
  }

  return assets
    .map((asset, index) => {
      const file = storedAssetToFile(asset)
      if (!file) {
        return null
      }

      return createCarouselItemFromFile(file, index, {
        headline: asset.headline,
        description: asset.description,
      })
    })
    .filter(Boolean)
}

function createSingleMediaStateFromDraft(draft) {
  const file = storedAssetToFile(draft?.singleAsset)
  if (!file) {
    return { file: null, previewUrl: '' }
  }

  return {
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

function CarouselCardList({ items, activeIndex, onSelect, onReorder, onRemove, onUpdateField }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragStart = (index) => (event) => {
    if (event.target.closest('[data-carousel-no-drag]')) {
      event.preventDefault()
      return
    }

    setDraggedIndex(index)
    setDragOverIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (index) => (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (index) => (event) => {
    event.preventDefault()
    if (draggedIndex === null || draggedIndex === index) {
      return
    }
    onReorder(draggedIndex, index)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="full-width carousel-card-list">
      <div className="carousel-card-list-header">
        <div className="carousel-card-list-title">
          <h4>Carousel cards</h4>
          <span className="carousel-card-list-format-note">
            (Support 2-10 cards with image/video creative format)
          </span>
        </div>
        <span className="carousel-card-list-count">
          {items.length} card{items.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className="carousel-card-list-lead">
        Please drag a card to change its position. <strong>Card 1</strong> is shown first in the ad.
      </p>
      <ol className="carousel-card-list-items">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={[
              'carousel-card-list-item',
              index === activeIndex ? 'is-active' : '',
              draggedIndex === index ? 'is-dragging' : '',
              dragOverIndex === index && draggedIndex !== index ? 'is-drag-over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            title="Drag anywhere on this card to reorder"
          >
            <div className="carousel-card-list-main">
              <div className="carousel-card-list-body">
                <div
                  className="carousel-card-list-select"
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(index)
                    }
                  }}
                  title={item.name}
                >
                  <span className="carousel-card-list-drag-grip" aria-hidden="true">
                    ⋮⋮
                  </span>
                  <span className="carousel-card-list-rank">{index + 1}</span>
                  <span className="carousel-card-list-thumb" data-carousel-no-drag aria-hidden="true">
                    {item.kind === 'video' ? (
                      <video src={item.url} muted playsInline preload="metadata" draggable={false} />
                    ) : (
                      <img src={item.url} alt="" draggable={false} />
                    )}
                  </span>
                </div>
                <label className="carousel-card-list-headline" data-carousel-no-drag>
                  <span className="carousel-card-list-field-label">Headline</span>
                  <input
                    type="text"
                    value={item.headline}
                    onChange={(event) => onUpdateField(index, 'headline', event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    maxLength={META_AD_HARD_LIMITS.headline.max}
                    placeholder="Headline"
                  />
                </label>
              </div>
              <label
                className="carousel-card-list-field carousel-card-list-field--description"
                data-carousel-no-drag
              >
                <span className="carousel-card-list-field-label">Description (optional)</span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(event) => onUpdateField(index, 'description', event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  maxLength={META_AD_HARD_LIMITS.description.max}
                  placeholder="Description"
                />
              </label>
            </div>
            <button
              type="button"
              className="carousel-card-list-action carousel-card-list-action--remove"
              data-carousel-no-drag
              draggable={false}
              onClick={() => onRemove(index)}
              disabled={items.length <= 2}
              aria-label={`Remove card ${index + 1}`}
              title={items.length <= 2 ? 'Carousel needs at least 2 cards' : 'Remove card'}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function AdPreviewApp({
  client,
  isAdmin = false,
  embedded = false,
  onSwitchClient,
  onLogout,
  onBackToPlatformHub,
  onNavigateMetaTool,
}) {
  const storageKey = getDraftStorageKey(client.id)
  const shouldPersistDraftRef = useRef(true)
  const [initialDraft] = useState(() => readStoredDraft(storageKey))
  const [initialSingleMedia] = useState(() => createSingleMediaStateFromDraft(initialDraft))
  const singlePreviewUrlRef = useRef('')
  const carouselItemsRef = useRef([])
  const [form, setForm] = useState(() => createInitialForm(client, initialDraft?.form))
  const [creativeType, setCreativeType] = useState(() => getInitialCreativeType(initialDraft))
  const [mediaRatio, setMediaRatio] = useState(() => getInitialMediaRatio(initialDraft))
  const [singleMediaFile, setSingleMediaFile] = useState(() => initialSingleMedia.file)
  const [singlePreviewUrl, setSinglePreviewUrl] = useState(() => initialSingleMedia.previewUrl)
  const [carouselItems, setCarouselItems] = useState(() =>
    createCarouselItemsFromAssets(initialDraft?.carouselAssets),
  )
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(() =>
    typeof initialDraft?.activeCarouselIndex === 'number' ? initialDraft.activeCarouselIndex : 0,
  )
  const [cloudEndpoint, setCloudEndpoint] = useState(() => {
    const endpoint = initialDraft?.cloudEndpoint
    return typeof endpoint === 'string' ? endpoint : ''
  })
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaUploadNotice, setMediaUploadNotice] = useState('')

  singlePreviewUrlRef.current = singlePreviewUrl
  carouselItemsRef.current = carouselItems

  const handleSignOut = () => {
    shouldPersistDraftRef.current = false
    clearAllStoredDrafts()
    onLogout()
  }

  useEffect(() => {
    const handlePageHide = () => {
      shouldPersistDraftRef.current = false
      clearAllStoredDrafts()
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      shouldPersistDraftRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function persistDraft() {
      if (!shouldPersistDraftRef.current) {
        return
      }

      const singleAsset = singleMediaFile ? await fileToStoredAsset(singleMediaFile) : null
      const carouselAssets = (
        await Promise.all(
          carouselItems
            .filter((item) => item.file)
            .map(async (item) => {
              const asset = await fileToStoredAsset(item.file)
              if (!asset) {
                return null
              }

              return {
                ...asset,
                headline: item.headline || '',
                description: item.description || '',
              }
            }),
        )
      ).filter(Boolean)

      if (cancelled || !shouldPersistDraftRef.current) {
        return
      }

      writeStoredDraft(storageKey, {
        form,
        creativeType,
        mediaRatioKey: mediaRatio.key,
        cloudEndpoint,
        singleAsset,
        carouselAssets,
        activeCarouselIndex,
      })
    }

    persistDraft()

    return () => {
      cancelled = true
    }
  }, [
    storageKey,
    form,
    creativeType,
    mediaRatio.key,
    cloudEndpoint,
    singleMediaFile,
    carouselItems,
    activeCarouselIndex,
  ])

  useEffect(() => {
    return () => {
      if (singlePreviewUrlRef.current) {
        URL.revokeObjectURL(singlePreviewUrlRef.current)
      }
      carouselItemsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    if (!Object.prototype.hasOwnProperty.call(INITIAL_FORM, name)) {
      return
    }

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  const replaceSingleMedia = (file) => {
    setSingleMediaFile(file || null)
    setSinglePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return file ? URL.createObjectURL(file) : ''
    })
  }

  const replaceCarouselMedia = (files) => {
    const normalizedFiles = Array.isArray(files) ? files.slice(0, 10) : []
    const nextItems = normalizedFiles.map((file, index) => createCarouselItemFromFile(file, index))

    setCarouselItems((previousItems) => {
      previousItems.forEach((item) => URL.revokeObjectURL(item.url))
      return nextItems
    })
    setActiveCarouselIndex(0)
  }

  const reorderCarouselItems = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) {
      return
    }

    setCarouselItems((previousItems) => {
      const nextItems = [...previousItems]
      const [movedItem] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, movedItem)
      return nextItems
    })
    setActiveCarouselIndex(toIndex)
  }

  const updateCarouselCardField = (index, field, value) => {
    setCarouselItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    )
  }

  const removeCarouselItem = (index) => {
    setCarouselItems((previousItems) => {
      const removed = previousItems[index]
      if (removed?.url) {
        URL.revokeObjectURL(removed.url)
      }
      return previousItems.filter((_, itemIndex) => itemIndex !== index)
    })
    setActiveCarouselIndex((previousIndex) => {
      if (previousIndex > index) {
        return previousIndex - 1
      }
      if (previousIndex >= index && index > 0) {
        return index - 1
      }
      return 0
    })
  }

  const handleSingleFileChange = async (event) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      replaceSingleMedia(null)
      setMediaUploadNotice('')
      return
    }

    if (creativeType === 'image' && (await looksLikeVideoFile(selected))) {
      setMediaUploadNotice(
        'That file is a video (MPEG-4). Set Creative Format to "Single Video" above, then choose the file again.',
      )
      event.target.value = ''
      return
    }

    if (creativeType === 'video' && !(await looksLikeVideoFile(selected))) {
      setMediaUploadNotice(
        'That file does not look like a video. Try your MP4 from Downloads, or rename it to end with .mp4.',
      )
      event.target.value = ''
      return
    }

    if (selected.size > MAX_STORED_MEDIA_BYTES) {
      setMediaUploadNotice(
        `File is ${formatFileSize(selected.size)}. Preview works now, but only files up to ${formatFileSize(MAX_STORED_MEDIA_BYTES)} are kept after you sign out or close the tab.`,
      )
    } else {
      setMediaUploadNotice('')
    }

    replaceSingleMedia(selected)
  }

  const handleCarouselChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      return
    }

    if (files.length < 2) {
      setMediaUploadNotice('Carousel ads need at least 2 cards. Select 2–10 image or video files.')
      event.target.value = ''
      return
    }

    if (files.length > 10) {
      setMediaUploadNotice('Carousel supports up to 10 cards. Only the first 10 files were added.')
    } else {
      setMediaUploadNotice('')
    }

    replaceCarouselMedia(files)
  }

  const submitPayloadByForm = (endpointUrl, payloadValue) => {
    const formElement = document.createElement('form')
    formElement.method = 'POST'
    formElement.action = endpointUrl
    formElement.target = '_blank'

    const payloadInput = document.createElement('input')
    payloadInput.type = 'hidden'
    payloadInput.name = 'payload'
    payloadInput.value = payloadValue

    formElement.appendChild(payloadInput)
    document.body.appendChild(formElement)
    formElement.submit()
    formElement.remove()
  }

  const handleSubmitToCloud = async () => {
    if (!cloudEndpoint.trim()) {
      setSubmitMessage('Please provide a cloud endpoint URL first.')
      return
    }

    if (!singleMediaFile && carouselItems.length === 0) {
      setSubmitMessage('Please upload at least one creative file before sending.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const singleAssetPayload = singleMediaFile
        ? {
            fileName: singleMediaFile.name,
            mimeType: singleMediaFile.type,
            kind: getFileKind(singleMediaFile),
            base64Data: await fileToBase64(singleMediaFile),
          }
        : null

      const carouselAssetsPayload = await Promise.all(
        carouselItems
          .filter((item) => item.file)
          .map(async (item, index) => ({
            index,
            fileName: item.file.name,
            mimeType: item.file.type,
            kind: item.kind,
            headline: item.headline || '',
            description: item.description || '',
            base64Data: await fileToBase64(item.file),
          })),
      )

      const metadata = {
        version: 1,
        submittedAt: new Date().toISOString(),
        form,
        creativeType,
        mediaRatioKey: mediaRatio.key,
        activeCarouselIndex,
        singleAsset: singleAssetPayload
          ? {
              fileName: singleAssetPayload.fileName,
              mimeType: singleAssetPayload.mimeType,
              kind: singleAssetPayload.kind,
            }
          : null,
        carouselAssets: carouselAssetsPayload.map((item) => ({
          index: item.index,
          fileName: item.fileName,
          mimeType: item.mimeType,
          kind: item.kind,
          headline: item.headline,
          description: item.description,
        })),
      }

      const payload = {
        metadata,
        singleAsset: singleAssetPayload,
        carouselAssets: carouselAssetsPayload,
      }

      submitPayloadByForm(cloudEndpoint.trim(), JSON.stringify(payload))
      setSubmitMessage('Request submitted. A new tab should show Apps Script response JSON.')
    } catch (error) {
      setSubmitMessage(`Send failed: ${error.message || 'Unexpected error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const destinationUrlIsPlaceholder =
    client.id === 'laneCrawford' && isClientDefaultDestinationUrl(client, form.destinationUrl)
  const displayUrl = form.displayUrl.trim()
  const ctaLabel = form.ctaLabel.trim()
  const pageName = form.pageName.trim()
  const facebookBrandName = getFacebookBrandName(pageName, client)
  const instagramBrandHandle = getInstagramBrandHandle(pageName, client)
  const instagramPageName = pageName || client.defaultPageName
  const footerLinkLabel = ctaLabel === WHATSAPP_CTA_LABEL ? 'WHATSAPP' : displayUrl
  const activeCarouselItem = carouselItems[activeCarouselIndex]
  const previewHeadline =
    creativeType === 'carousel' ? activeCarouselItem?.headline?.trim() || '' : form.headline.trim()
  const previewDescription =
    creativeType === 'carousel'
      ? activeCarouselItem?.description?.trim() || ''
      : form.description.trim()
  const previewVisualKey = useMemo(() => {
    if (creativeType === 'carousel') {
      const item = carouselItems[activeCarouselIndex]
      return [
        'carousel',
        mediaRatio.key,
        activeCarouselIndex,
        item?.url ?? '',
        item?.kind ?? '',
        carouselItems.length,
      ].join('|')
    }

    return ['single', creativeType, mediaRatio.key, singlePreviewUrl ?? ''].join('|')
  }, [creativeType, mediaRatio, singlePreviewUrl, activeCarouselIndex, carouselItems])
  const renderMedia = (ratioCssValue) => {
    const mediaStyle = { '--media-ratio': ratioCssValue }

    if (creativeType === 'video') {
      return singlePreviewUrl ? (
        <video style={mediaStyle} src={singlePreviewUrl} controls />
      ) : (
        <div style={mediaStyle} className="placeholder">
          Upload a video to preview
        </div>
      )
    }

    if (creativeType === 'carousel') {
      return carouselItems.length > 0 ? (
        <div className="carousel-composer" style={mediaStyle}>
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${activeCarouselIndex * 100}%)` }}
          >
            {carouselItems.map((item, index) => (
              <div key={item.id} className="carousel-card">
                <span className="card-tag">Card {index + 1}</span>
                {item.kind === 'video' ? (
                  <video src={item.url} controls muted playsInline />
                ) : (
                  <img src={item.url} alt={`Carousel ${index + 1}`} />
                )}
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button
              type="button"
              onClick={() =>
                setActiveCarouselIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={activeCarouselIndex === 0}
            >
              Prev
            </button>
            <span>
              {activeCarouselIndex + 1} / {carouselItems.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveCarouselIndex((prev) =>
                  Math.min(carouselItems.length - 1, prev + 1),
                )
              }
              disabled={activeCarouselIndex >= carouselItems.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div style={mediaStyle} className="placeholder">
          Upload 2-10 image/video cards to preview
        </div>
      )
    }

    return singlePreviewUrl ? (
      <img style={mediaStyle} src={singlePreviewUrl} alt="Ad creative preview" />
    ) : (
      <div style={mediaStyle} className="placeholder">
        Upload an image to preview
      </div>
    )
  }


  const previewPanels = (
    <>
      <section className="builder-panel">
        <div className="form-shell">
          <section className="form-section">
            <div className="section-heading">
              <h3>Campaign Setup</h3>
              <p>Basic ad identity shown in preview.</p>
            </div>
            <div className="form-grid">
              {client.id === 'laneCrawford' ? (
                <div className="campaign-identity-row">
                  <label className="campaign-identity-field">
                    Page Name
                    <input
                      type="text"
                      className="campaign-identity-page-name"
                      value={form.pageName}
                      readOnly
                      aria-readonly="true"
                    />
                  </label>
                  <label className="campaign-identity-field">
                    <span>
                      Ad Name <span className="field-optional">(optional)</span>
                    </span>
                    <input
                      name="campaignName"
                      value={form.campaignName}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <label className="full-width">
                    Page Name
                    <select name="pageName" value={form.pageName} onChange={handleInputChange}>
                      {client.pageNames.length > 1 ? (
                        <option value="">Select page name</option>
                      ) : null}
                      {client.pageNames.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="full-width">
                    Ad Name
                    <input
                      name="campaignName"
                      value={form.campaignName}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              )}

              <label className="full-width">
                Destination URL
                <div className="destination-url-row">
                  <input
                    name="destinationUrl"
                    className={
                      destinationUrlIsPlaceholder ? 'destination-url-input--placeholder' : undefined
                    }
                    value={form.destinationUrl}
                    onChange={handleInputChange}
                    placeholder={
                      client.id === 'laneCrawford' ? undefined : client.defaultDestinationUrl
                    }
                  />
                  <button
                    type="button"
                    className="destination-url-open"
                    disabled={!getOpenableUrl(form.destinationUrl)}
                    onClick={() => {
                      const href = getOpenableUrl(form.destinationUrl)
                      if (href) {
                        window.open(href, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    aria-label="Open destination URL in a new tab"
                    title="Open landing page in new tab"
                  >
                    <LinkOutlined aria-hidden="true" />
                  </button>
                </div>
              </label>

              <label className="full-width">
                Display URL
                <select name="displayUrl" value={form.displayUrl} onChange={handleInputChange}>
                  <option value="">Select display URL</option>
                  {client.displayUrls.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h3>Campaign Objective</h3>
            </div>
            <div className="form-grid">
              <label>
                Objective
                <select
                  name="campaignObjective"
                  value={form.campaignObjective}
                  onChange={handleInputChange}
                >
                  <option value="">Select objective</option>
                  {CAMPAIGN_OBJECTIVE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                CTA Button
                <select name="ctaLabel" value={form.ctaLabel} onChange={handleInputChange}>
                  <option value="">Select CTA</option>
                  {FACEBOOK_CTA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h3>Ad Copy</h3>
              <p>
                Write the copy users see in the feed placement. Counters show Meta&apos;s
                maximum input limits (not recommended display lengths).
              </p>
            </div>
            <div className="form-grid">
              <label className="full-width">
                <span className="field-label-row">
                  <span>Primary Text</span>
                  <FieldCharCounter fieldKey="primaryText" value={form.primaryText} />
                </span>
                <textarea
                  name="primaryText"
                  value={form.primaryText}
                  onChange={handleInputChange}
                  rows="16"
                  maxLength={META_AD_HARD_LIMITS.primaryText.max}
                />
              </label>

              {creativeType !== 'carousel' ? (
                <>
                  <label>
                    <span className="field-label-row">
                      <span>Headline</span>
                      <FieldCharCounter fieldKey="headline" value={form.headline} />
                    </span>
                    <input
                      name="headline"
                      value={form.headline}
                      onChange={handleInputChange}
                      maxLength={META_AD_HARD_LIMITS.headline.max}
                    />
                  </label>

                  <label>
                    <span className="field-label-row">
                      <span>Description (optional)</span>
                      <FieldCharCounter fieldKey="description" value={form.description} />
                    </span>
                    <input
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      maxLength={META_AD_HARD_LIMITS.description.max}
                    />
                  </label>
                </>
              ) : null}
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h3>Creative</h3>
              <p>Select format, ratio, and upload files.</p>
            </div>
            <div className="form-grid">
              <label>
                Creative Format
                <select value={creativeType} onChange={(e) => setCreativeType(e.target.value)}>
                  {Object.entries(CREATIVE_TYPE).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Creative Size
                <select
                  value={mediaRatio.key}
                  onChange={(event) => {
                    const selected = MEDIA_RATIOS.find((item) => item.key === event.target.value)
                    setMediaRatio(selected || MEDIA_RATIOS[0])
                  }}
                >
                  {MEDIA_RATIOS.map((ratio) => (
                    <option key={ratio.key} value={ratio.key}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-width media-upload-field">
                {creativeType === 'carousel' ? (
                  <span className="media-upload-label-row">
                    <span className="media-upload-label">Upload Carousel Cards</span>
                    <span className="media-upload-hint media-upload-hint--inline">
                      Select 2–10 files at once, then drag cards in the list below to set priority —{' '}
                      <strong>Card 1</strong> is shown first.
                    </span>
                  </span>
                ) : creativeType === 'video' ? (
                  'Upload Video'
                ) : (
                  'Upload Image'
                )}
                <div className="media-upload-bar">
                  <div className="media-upload-picker">
                    <div className="media-upload-trigger-wrap">
                      <span className="media-upload-trigger" aria-hidden="true">
                        {creativeType === 'carousel' ? 'Choose files' : 'Choose file'}
                      </span>
                      <input
                        key={creativeType}
                        className="media-upload-input"
                        type="file"
                        multiple={creativeType === 'carousel'}
                        aria-label={
                          creativeType === 'carousel'
                            ? 'Choose carousel image or video files'
                            : creativeType === 'video'
                              ? 'Choose video file'
                              : 'Choose image file'
                        }
                        {...(getMediaFileAccept(creativeType)
                          ? { accept: getMediaFileAccept(creativeType) }
                          : {})}
                        onChange={
                          creativeType === 'carousel'
                            ? handleCarouselChange
                            : handleSingleFileChange
                        }
                      />
                    </div>
                    <span className="media-upload-status">
                      {creativeType === 'carousel'
                        ? carouselItems.length > 0
                          ? `${carouselItems.length} file${carouselItems.length === 1 ? '' : 's'} selected`
                          : 'No files chosen'
                        : singleMediaFile?.name || 'No file chosen'}
                    </span>
                  </div>
                  {creativeType === 'video' ? (
                    <p className="media-upload-hint media-upload-hint--in-bar">
                      The file picker shows all files. Open <strong>Downloads</strong>, select your
                      video (e.g. Mday Video), or choose <strong>All Files</strong> if it is hidden.
                    </p>
                  ) : creativeType === 'image' ? (
                    <p className="media-upload-hint media-upload-hint--in-bar">
                      To upload video, set <strong>Creative Format</strong> to{' '}
                      <strong>Single Video</strong> first.
                    </p>
                  ) : null}
                </div>
              </label>

              {creativeType === 'carousel' && carouselItems.length > 0 ? (
                <CarouselCardList
                  items={carouselItems}
                  activeIndex={activeCarouselIndex}
                  onSelect={setActiveCarouselIndex}
                  onReorder={reorderCarouselItems}
                  onRemove={removeCarouselItem}
                  onUpdateField={updateCarouselCardField}
                />
              ) : null}

              {mediaUploadNotice ? (
                <p className="full-width media-upload-notice" role="status">
                  {mediaUploadNotice}
                </p>
              ) : null}

              {creativeType === 'video' ||
              (creativeType === 'carousel' && carouselItems.length === 0) ? (
                <div className="full-width spec-note">
                  {creativeType === 'carousel' ? PLACEMENT_NOTES.carousel : PLACEMENT_NOTES.reels}
                </div>
              ) : null}
            </div>
          </section>

          {SHOW_SUBMIT_SECTION ? (
            <section className="form-section">
              <div className="section-heading">
                <h3>Confirm & Submit</h3>
                <p>One-click submit to your Apps Script, cloud function, or server endpoint.</p>
              </div>
            <div className="form-grid">
              <label className="full-width">
                Endpoint URL
                <input
                  value={cloudEndpoint}
                  onChange={(event) => setCloudEndpoint(event.target.value)}
                  placeholder="https://your-cloud-endpoint.example.com/submit"
                />
              </label>
              <div className="full-width cloud-actions">
                <button type="button" className="cloud-submit" onClick={handleSubmitToCloud} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send to Cloud'}
                </button>
              </div>
              {submitMessage ? <p className="full-width cloud-message">{submitMessage}</p> : null}
            </div>
          </section>
          ) : null}
        </div>
      </section>

      <section className="preview-panel">
        <header className="preview-panel-header">
          <h2 className="preview-panel-title">Ad Preview</h2>
          <p className="preview-panel-desc">
            Feed mocks update live as you edit copy and creative.
          </p>
        </header>

        <div className="preview-placements">
          <div className="placement-block placement-block--facebook">
            <div className="placement-heading">
              <span className="platform-pill platform-pill--facebook">Facebook</span>
              <h3 className="placement-title">Feed placement</h3>
            </div>
            <p className="placement-spec">Meta mobile feed · 402px column width</p>
            <div key={previewVisualKey} className="preview-stage-shell">
              <div className="preview-layout preview-layout--stage preview-layout--facebook">
              <article className="feed-preview fb-card">
                <header className="fb-header">
                  <PageAvatar
                    pageName={facebookBrandName}
                    brandLogos={client.fbBrandLogos}
                    defaultLogoUrl={client.brandLogo}
                  />
                  <div>
                    {facebookBrandName ? (
                      <h3 style={{ fontWeight: '600' }}>{facebookBrandName}</h3>
                    ) : null}
                    <span className="fb-meta">
                      Ad <span className="fb-globe" aria-hidden="true">🌐</span>
                    </span>
                  </div>
                  <div className="fb-header-actions" aria-hidden="true">
                    <span>···</span>
                    <span>×</span>
                  </div>
                </header>

                <PrimaryTextPreview
                  text={form.primaryText}
                  clampLength={META_PRIMARY_TEXT_CLAMP}
                  moreLabel="Show more"
                  lessLabel="Show less"
                />

                <div className="media-block">{renderMedia(mediaRatio.cssValue)}</div>

                <footer>
                  <div>
                    {footerLinkLabel ? (
                      <small className={ctaLabel === WHATSAPP_CTA_LABEL ? 'footer-cta-type' : undefined}>
                        {footerLinkLabel}
                      </small>
                    ) : null}
                    {previewHeadline ? <h4>{previewHeadline}</h4> : null}
                    {previewDescription ? <p>{previewDescription}</p> : null}
                  </div>
                  <CtaButton label={form.ctaLabel} />
                </footer>

                <FbEngagementBar />
              </article>
              </div>
            </div>
          </div>

          <div className="placement-block placement-block--instagram">
            <div className="placement-heading">
              <span className="platform-pill platform-pill--instagram">Instagram</span>
              <h3 className="placement-title">Feed placement</h3>
            </div>
            <p className="placement-spec">Meta mobile feed · 390px column width</p>
            <div key={previewVisualKey} className="preview-stage-shell">
              <div className="preview-layout preview-layout--stage preview-layout--instagram">
              <article className="ig-feed-preview">
                <header className="ig-header">
                  <PageAvatar
                    pageName={instagramPageName}
                    brandLogos={client.igBrandLogos}
                    defaultLogoUrl={client.brandLogo}
                  />
                  <div className="ig-header-meta">
                    {instagramBrandHandle ? (
                      <strong className="ig-username">{instagramBrandHandle}</strong>
                    ) : null}
                    <span className="ig-ad-label">Ad</span>
                  </div>
                  <div className="ig-header-actions" aria-hidden="true">
                    <span>⋯</span>
                  </div>
                </header>

                <div className="media-block ig-media-block">
                  {renderMedia(mediaRatio.cssValue)}
                </div>

                <IgCtaStrip label={form.ctaLabel} />

                <IgEngagementBar />

                <div className="ig-caption">
                  <IgCaptionPreview
                    username={instagramBrandHandle}
                    text={form.primaryText}
                    headline={creativeType === 'carousel' ? previewHeadline : ''}
                  />
                </div>
              </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  if (embedded) {
    return previewPanels
  }

  return (
    <main className="app-shell app-shell--with-workspace-header">
      <MetaWorkspaceHeader
        client={client}
        isAdmin={isAdmin}
        activeTool="ad-preview"
        onBackToPlatformHub={onBackToPlatformHub}
        onNavigateMetaTool={onNavigateMetaTool}
        onSwitchClient={onSwitchClient}
        onSignOut={handleSignOut}
      />
      {previewPanels}
    </main>
  )
}

function App() {
  const [session, setSession] = useState(() => readSession())
  const [laneCrawfordScreen, setLaneCrawfordScreen] = useState('hub')

  if (!session) {
    return <ClientGate onAuthenticated={setSession} />
  }

  const handleLogout = () => {
    clearAllStoredDrafts()
    clearClientSession()
    setLaneCrawfordScreen('hub')
    setSession(null)
  }

  if (session.kind === 'admin' && !session.activeClient) {
    return (
      <AdminClientPicker
        adminProfile={session.adminProfile}
        onSelectClient={(client) => {
          writeAdminSession(client.id, session.adminProfile)
          setLaneCrawfordScreen(clientUsesPlatformHub(client) ? 'hub' : 'meta-preview')
          setSession({ kind: 'admin', adminProfile: session.adminProfile, activeClient: client })
        }}
        onLogout={handleLogout}
      />
    )
  }

  const activeClient = session.kind === 'client' ? session.client : session.activeClient
  const isAdmin = session.kind === 'admin'
  const usesPlatformHub = clientUsesPlatformHub(activeClient)
  const showLaneCrawfordHub = usesPlatformHub && laneCrawfordScreen === 'hub'
  const showPlatformHubMetaWorkspace =
    usesPlatformHub &&
    (laneCrawfordScreen === 'meta-preview' || laneCrawfordScreen === 'ad-specs')

  const handleNavigateMetaTool = (tool) => {
    if (tool === 'ad-preview') {
      setLaneCrawfordScreen('meta-preview')
    } else if (tool === 'ad-specs') {
      setLaneCrawfordScreen('ad-specs')
    }
  }

  const handleBackToPlatformHub = usesPlatformHub ? () => setLaneCrawfordScreen('hub') : undefined

  const handleSwitchClient = (client) => {
    if (isAdmin) {
      writeAdminSession(client.id, session.adminProfile)
      setLaneCrawfordScreen(clientUsesPlatformHub(client) ? 'hub' : 'meta-preview')
      setSession({
        kind: 'admin',
        adminProfile: session.adminProfile,
        activeClient: client,
      })
    }
  }

  if (showLaneCrawfordHub) {
    return (
      <LaneCrawfordPlatformHub
        client={activeClient}
        isAdmin={isAdmin}
        onOpenMetaPreview={() => setLaneCrawfordScreen('meta-preview')}
        onOpenAdSpecs={() => setLaneCrawfordScreen('ad-specs')}
        onLogout={handleLogout}
      />
    )
  }

  if (showPlatformHubMetaWorkspace) {
    const activeTool = laneCrawfordScreen === 'ad-specs' ? 'ad-specs' : 'ad-preview'
    const shellClassName = [
      'app-shell',
      'app-shell--with-workspace-header',
      'app-shell--workspace-enter',
      laneCrawfordScreen === 'ad-specs' ? 'app-shell--ad-specs' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <main className={shellClassName}>
        <MetaWorkspaceHeader
          client={activeClient}
          isAdmin={isAdmin}
          activeTool={activeTool}
          onBackToPlatformHub={handleBackToPlatformHub}
          onNavigateMetaTool={handleNavigateMetaTool}
          onSwitchClient={handleSwitchClient}
          onSignOut={handleLogout}
        />
        {laneCrawfordScreen === 'ad-specs' ? (
          <MetaAdSpecs
            key={`${activeClient.id}-ad-specs`}
            embedded
            client={activeClient}
            isAdmin={isAdmin}
            onSwitchClient={handleSwitchClient}
            onLogout={handleLogout}
          />
        ) : (
          <AdPreviewApp
            key={`${activeClient.id}-meta-preview`}
            embedded
            client={activeClient}
            isAdmin={isAdmin}
            onSwitchClient={handleSwitchClient}
            onLogout={handleLogout}
            onBackToPlatformHub={handleBackToPlatformHub}
            onNavigateMetaTool={handleNavigateMetaTool}
          />
        )}
      </main>
    )
  }

  return (
    <AdPreviewApp
      key={`${activeClient.id}-meta-preview`}
      client={activeClient}
      isAdmin={isAdmin}
      onSwitchClient={handleSwitchClient}
      onLogout={handleLogout}
    />
  )
}

export default App

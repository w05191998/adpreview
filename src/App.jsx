import { WhatsAppOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
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
  { key: '1.91:1', label: 'Landscape (1.91:1)', cssValue: '1.91 / 1' },
]

const DISPLAY_URL_OPTIONS = ['trinitymedical.com.hk']

const TRINITY_PAGE_NAME = 'Trinity Medical Centre 全仁醫務中心'
const TRINITY_AESTHETICS_PAGE_NAME = 'Trinity Medical Aesthetics 全仁醫學美容'
const PAGE_NAME_OPTIONS = [TRINITY_PAGE_NAME, TRINITY_AESTHETICS_PAGE_NAME]

const TRINITY_BRAND_LOGO = '/trinity-fb-brand-logo.png'

const FB_BRAND_LOGOS = {
  [TRINITY_PAGE_NAME]: TRINITY_BRAND_LOGO,
  [TRINITY_AESTHETICS_PAGE_NAME]: '/trinity-aesthetics-logo.png',
}

const IG_BRAND_LOGOS = {
  [TRINITY_PAGE_NAME]: TRINITY_BRAND_LOGO,
  [TRINITY_AESTHETICS_PAGE_NAME]: '/trinity-aesthetics-logo.png',
}

const IG_DEFAULT_HANDLE = 'trinitymedicalhongkong'

const IG_PAGE_HANDLES = {
  [TRINITY_PAGE_NAME]: IG_DEFAULT_HANDLE,
  [TRINITY_AESTHETICS_PAGE_NAME]: 'trinitymedicalaesthetics',
}

function getInstagramHandle(pageName) {
  const normalizedName = pageName.trim()
  if (!normalizedName) {
    return IG_DEFAULT_HANDLE
  }

  if (IG_PAGE_HANDLES[normalizedName]) {
    return IG_PAGE_HANDLES[normalizedName]
  }

  return IG_DEFAULT_HANDLE
}

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

const FACEBOOK_CTA_OPTIONS = [
  'Apply Now',
  'Book Now',
  'Contact Us',
  'Download',
  'Get Offer',
  'Get Quote',
  'Learn More',
  'Listen Now',
  'Order Now',
  'Play Game',
  'Request Time',
  'See Menu',
  'Send Message',
  'Send WhatsApp Message',
  'Shop Now',
  'Sign Up',
  'Subscribe',
  'Watch More',
  'Watch Video',
]

const INITIAL_FORM = {
  campaignName: '',
  pageName: '',
  primaryText: '',
  headline: '',
  description: '',
  ctaLabel: '',
  destinationUrl: '',
  displayUrl: '',
}

const SHOW_SUBMIT_SECTION = false

const STORAGE_KEY = 'adpreview-draft-v1'
const MAX_STORED_MEDIA_BYTES = 3 * 1024 * 1024

function readStoredDraft() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function writeStoredDraft(draft) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
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

function EngagementIcon({ className, children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function FbLikeIcon() {
  return (
    <EngagementIcon className="fb-engagement-icon">
      <path d="M7 10v12" />
      <path d="M7 10l-1.4-4.2a1.4 1.4 0 0 1 1.33-1.8H9.5a1 1 0 0 0 .96-.74l.38-1.42A1.6 1.6 0 0 1 12.36 2h.2a2 2 0 0 1 1.95 1.68l.72 4.32A4.2 4.2 0 0 0 18 10h2.8a2 2 0 0 1 2 2v1.1a2 2 0 0 1-2 2h-1.1a1 1 0 0 0-.95.7l-.98 2.94A2 2 0 0 1 14.7 22H10" />
    </EngagementIcon>
  )
}

function FbCommentIcon() {
  return (
    <EngagementIcon className="fb-engagement-icon">
      <path d="M20 3H6a3.5 3.5 0 0 0-3.5 3.5v8A3.5 3.5 0 0 0 6 18h1.2l2.6 3.2 2.6-3.2H18A3.5 3.5 0 0 0 21.5 14.5v-8A3.5 3.5 0 0 0 18 3z" />
    </EngagementIcon>
  )
}

function FbShareIcon() {
  return (
    <EngagementIcon className="fb-engagement-icon">
      <path d="M18 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
      <path d="M6 15a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
      <path d="M18 22a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="M15.41 6.51l-6.82 3.98" />
    </EngagementIcon>
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

function PageAvatar({ pageName, brandLogos = FB_BRAND_LOGOS, defaultLogoUrl = '' }) {
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

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1025px)')
    const onChange = (event) => setIsDesktop(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return isDesktop
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

function IgCaptionPreview({ username, text, clampLength = IG_CAPTION_CLAMP }) {
  const [expanded, setExpanded] = useState(false)
  const normalizedText = normalizeIgCaptionText(text)
  const normalizedUsername = username.trim()

  useEffect(() => {
    setExpanded(false)
  }, [normalizedText])

  if (!normalizedText && !normalizedUsername) {
    return null
  }

  if (!normalizedText) {
    return (
      <div className="ig-caption-body ig-caption-body--collapsed">
        <p className="ig-caption-line">
          <strong className="ig-caption-user">{normalizedUsername}</strong>
        </p>
      </div>
    )
  }

  const shouldClamp = normalizedText.length > clampLength || normalizedText.includes('\n')
  const collapsedCaption = getIgCollapsedCaptionLines(normalizedText, clampLength)
  const lines = expanded ? splitIgCaptionLines(text) : collapsedCaption.lines

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
          {!expanded && collapsedCaption.hasMore && lineIndex === lines.length - 1 ? (
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
  feed: 'Feed supports 1:1 and 4:5. Meta recommends 4:5 for Facebook Feed single image.',
  carousel:
    'Carousel supports 2-10 cards. Mixed image/video is allowed; keep a consistent ratio across cards.',
  reels:
    'Reels recommends 9:16 (vertical). Keep top 14% and bottom 35% clear for UI overlays.',
}

const getFileKind = (file) => {
  if (file.type.startsWith('video/')) {
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

      return {
        id: `${asset.fileName}-${index}`,
        kind: asset.kind || getFileKind(file),
        name: asset.fileName,
        file,
        url: URL.createObjectURL(file),
      }
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

function App() {
  const isDesktopLayout = useDesktopLayout()
  const [initialDraft] = useState(() => readStoredDraft())
  const [initialSingleMedia] = useState(() => createSingleMediaStateFromDraft(initialDraft))
  const singlePreviewUrlRef = useRef('')
  const carouselItemsRef = useRef([])
  const [form, setForm] = useState(() => hydrateForm(initialDraft?.form))
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

  singlePreviewUrlRef.current = singlePreviewUrl
  carouselItemsRef.current = carouselItems

  useEffect(() => {
    let cancelled = false

    async function persistDraft() {
      const singleAsset = singleMediaFile ? await fileToStoredAsset(singleMediaFile) : null
      const carouselAssets = (
        await Promise.all(
          carouselItems.filter((item) => item.file).map((item) => fileToStoredAsset(item.file)),
        )
      ).filter(Boolean)

      if (cancelled) {
        return
      }

      writeStoredDraft({
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
    const nextItems = normalizedFiles.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      kind: getFileKind(file),
      name: file.name,
      file,
      url: URL.createObjectURL(file),
    }))

    setCarouselItems((previousItems) => {
      previousItems.forEach((item) => URL.revokeObjectURL(item.url))
      return nextItems
    })
    setActiveCarouselIndex(0)
  }

  const handleSingleFileChange = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      replaceSingleMedia(null)
      return
    }
    replaceSingleMedia(selected)
  }

  const handleCarouselChange = (event) => {
    replaceCarouselMedia(Array.from(event.target.files || []))
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

  const displayUrl = form.displayUrl.trim()
  const ctaLabel = form.ctaLabel.trim()
  const pageName = form.pageName.trim()
  const instagramHandle = getInstagramHandle(pageName)
  const footerLinkLabel = ctaLabel === WHATSAPP_CTA_LABEL ? 'WHATSAPP' : displayUrl
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


  return (
    <main className="app-shell">
      <section className="builder-panel">
        <div className="panel-header">
          <h1>Meta Ad Creative Preview</h1>
          <p>Upload ad materials and preview Facebook and Instagram feed placements.</p>
        </div>

        <div className="form-shell">
          <section className="form-section">
            <div className="section-heading">
              <h3>Campaign Setup</h3>
              <p>Basic ad identity shown in preview.</p>
            </div>
            <div className="form-grid">
              <label className="full-width">
                Page Name
                <select name="pageName" value={form.pageName} onChange={handleInputChange}>
                  <option value="">Select page name</option>
                  {PAGE_NAME_OPTIONS.map((option) => (
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

              <label className="full-width">
                Destination URL
                <input
                  name="destinationUrl"
                  value={form.destinationUrl}
                  onChange={handleInputChange}
                  placeholder="https://trinitymedical.com.hk/zh/e-shop/"
                />
              </label>

              <label className="full-width">
                Display URL
                <select name="displayUrl" value={form.displayUrl} onChange={handleInputChange}>
                  <option value="">Select display URL</option>
                  {DISPLAY_URL_OPTIONS.map((option) => (
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
              <p>Write the copy users see in the feed placement.</p>
            </div>
            <div className="form-grid">
              <label className="full-width">
                Primary Text
                <textarea
                  name="primaryText"
                  value={form.primaryText}
                  onChange={handleInputChange}
                  rows="16"
                />
              </label>

              <label>
                Headline
                <input
                  name="headline"
                  value={form.headline}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Description (optional)
                <input
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                />
              </label>

              <label className="full-width">
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
              <h3>Creative</h3>
              <p>Select format, ratio, and upload files.</p>
            </div>
            <div className="form-grid">
              <label>
                Creative Type
                <select value={creativeType} onChange={(e) => setCreativeType(e.target.value)}>
                  {Object.entries(CREATIVE_TYPE).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Primary Ratio
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

              <label className="full-width">
                {creativeType === 'carousel'
                  ? 'Upload Carousel Cards'
                  : creativeType === 'video'
                    ? 'Upload Video'
                    : 'Upload Image'}
                <input
                  type="file"
                  multiple={creativeType === 'carousel'}
                  accept={
                    creativeType === 'carousel'
                      ? 'image/*,video/*'
                      : creativeType === 'video'
                        ? 'video/*'
                        : 'image/*'
                  }
                  onChange={
                    creativeType === 'carousel'
                      ? handleCarouselChange
                      : handleSingleFileChange
                  }
                />
              </label>

              <div className="full-width spec-note">
                {creativeType === 'carousel'
                  ? PLACEMENT_NOTES.carousel
                  : creativeType === 'video'
                    ? PLACEMENT_NOTES.reels
                    : PLACEMENT_NOTES.feed}
              </div>
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
        <div className="preview-placements">
          <div className="placement-block">
            <h2>Facebook Feed Placement</h2>
            <div className="preview-layout">
              <article className="feed-preview fb-card">
                <header className="fb-header">
                  <PageAvatar pageName={pageName} />
                  <div>
                    {pageName ? <h3 style={{ fontWeight: '600' }}>{pageName}</h3> : null}
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
                  clampLength={isDesktopLayout ? null : META_PRIMARY_TEXT_CLAMP}
                />

                <div className="media-block">{renderMedia(mediaRatio.cssValue)}</div>

                <footer>
                  <div>
                    {footerLinkLabel ? (
                      <small className={ctaLabel === WHATSAPP_CTA_LABEL ? 'footer-cta-type' : undefined}>
                        {footerLinkLabel}
                      </small>
                    ) : null}
                    {form.headline.trim() ? <h4>{form.headline}</h4> : null}
                    {form.description.trim() ? <p>{form.description}</p> : null}
                  </div>
                  <CtaButton label={form.ctaLabel} />
                </footer>

                <FbEngagementBar />
              </article>
            </div>
          </div>

          <div className="placement-block">
            <h2>Instagram Feed Placement</h2>
            <div className="preview-layout">
              <article className="ig-feed-preview">
                <header className="ig-header">
                  <PageAvatar
                    pageName={pageName}
                    brandLogos={IG_BRAND_LOGOS}
                    defaultLogoUrl={TRINITY_BRAND_LOGO}
                  />
                  <div className="ig-header-meta">
                    {instagramHandle ? <strong className="ig-username">{instagramHandle}</strong> : null}
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
                  <IgCaptionPreview username={instagramHandle} text={form.primaryText} />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

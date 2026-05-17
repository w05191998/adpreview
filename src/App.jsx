import {
  CommentOutlined,
  LikeOutlined,
  ShareAltOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
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

const BRAND_LOGOS = {
  [TRINITY_PAGE_NAME]: '/trinity-brand-logo.png',
  [TRINITY_AESTHETICS_PAGE_NAME]: '/trinity-aesthetics-logo.png',
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

const DEFAULT_FORM = {
  campaignName: 'Trinity Medical - 65項精選檢查計劃',
  pageName: TRINITY_PAGE_NAME,
  primaryText: `🔰【入門級體檢｜65項精選檢查計劃】
🔗 https://bit.ly/3UoRDj5

日日返工 OT、外賣當三餐、運動時間少，你有冇諗過身體入面其實已經響緊警號？好多30+打工仔都有「隱性病」而自己完全唔知！

【65項精選檢查計劃】
包括超聲波掃描及65項血液檢查：
✅ Ultrasound 超聲波掃描：乳房、盆腔（女士）｜前列腺、膀胱、腎臟（男士）
✅ 65項血液檢查：三高、肝腎功能、肝炎指數
✅ 癌症指標：肝癌、鼻咽癌、胰臟癌、前列腺癌等
✅ 肺部X光、心電圖、尿液檢查、骨骼與腸道評估

💰只需 $4,000，即日完成，最啱忙碌嘅香港人！

👩‍⚕️ 特別適合：
✅ 30+ 打工仔，長時間坐office、壓力大
✅ 從未做過體檢、唔知點開始
✅ 關心自己健康，想早啲預防「隱性病」

📍中環、尖沙咀、銅鑼灣
💳 可使用醫療券
🕒 一日完成

未雨綢繆，先可以真正掌握健康！

👉 立即了解及預約
https://bit.ly/3UoRDj5

💬 WhatsApp 1對1健康顧問
https://bit.ly/4dnCCsy

🛒全仁網店：
https://trinitymedical.com.hk/zh/e-shop/
📲 WhatsApp查詢及預約：
https://bit.ly/3P9A877
☎️ 客戶專線 CS Hotline：2192 7022

服務地點：
📍中環 | 娛樂行22樓
📍銅鑼灣 | 英皇鐘錶珠寶中心20樓
📍尖沙咀 | 中港城 5 座15樓

#全仁醫務中心 #身體檢查 #超聲波 #年度體檢`,
  headline: '入門級體檢 | 65項精選檢查計劃',
  description: '',
  ctaLabel: 'Shop Now',
  destinationUrl: 'https://trinitymedical.com.hk/zh/e-shop/',
  displayUrl: DISPLAY_URL_OPTIONS[0],
}

const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
const URL_TEST_PATTERN = /^(https?:\/\/|www\.)/i

const META_PRIMARY_TEXT_CLAMP = 125

const WHATSAPP_CTA_LABEL = 'Send WhatsApp Message'

function WhatsAppIcon() {
  return <WhatsAppOutlined className="cta-whatsapp-icon" aria-hidden="true" />
}

function CtaButton({ label }) {
  const ctaLabel = label || DEFAULT_FORM.ctaLabel

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

const FB_ENGAGEMENT_ACTIONS = [
  { key: 'like', label: 'Like', Icon: LikeOutlined },
  { key: 'comment', label: 'Comment', Icon: CommentOutlined },
  { key: 'share', label: 'Share', Icon: ShareAltOutlined },
]

function FbEngagementBar() {
  return (
    <div className="fb-engagement" aria-hidden="true">
      {FB_ENGAGEMENT_ACTIONS.map(({ key, label, Icon }) => (
        <div key={key} className="fb-engagement-action" role="presentation">
          <Icon className="fb-engagement-icon" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function PageAvatar({ pageName }) {
  const normalizedName = pageName.trim()
  const logoUrl = BRAND_LOGOS[normalizedName]

  if (logoUrl) {
    return <img className="avatar avatar--brand" src={logoUrl} alt={`${normalizedName} logo`} />
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
  return (lastBreak > 80 ? slice.slice(0, lastBreak) : slice).trimEnd()
}

function PrimaryTextPreview({ text, clampLength = META_PRIMARY_TEXT_CLAMP }) {
  const [expanded, setExpanded] = useState(false)
  const normalizedText = text.trim()
  const shouldClamp = normalizedText.length > clampLength
  const visibleText =
    expanded || !shouldClamp
      ? normalizedText
      : truncatePrimaryText(normalizedText, clampLength)

  const renderLine = (line, lineIndex) => {
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

  const lines = visibleText.split('\n')

  return (
    <div className="primary-copy-block">
      <div className="primary-copy">
        {lines.map((line, lineIndex) => (
          <p key={lineIndex} className={line.length === 0 ? 'primary-copy-gap' : undefined}>
            {line.length === 0 ? '\u00a0' : renderLine(line, lineIndex)}
            {!expanded && shouldClamp && lineIndex === lines.length - 1 ? (
              <>
                {' '}
                <button type="button" className="see-more" onClick={() => setExpanded(true)}>
                  See more
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
          See less
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

function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [creativeType, setCreativeType] = useState('image')
  const [mediaRatio, setMediaRatio] = useState(MEDIA_RATIOS[0])
  const [singleMediaFile, setSingleMediaFile] = useState(null)
  const [singlePreviewUrl, setSinglePreviewUrl] = useState('')
  const [carouselItems, setCarouselItems] = useState([])
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0)
  const [cloudEndpoint, setCloudEndpoint] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (singlePreviewUrl) {
        URL.revokeObjectURL(singlePreviewUrl)
      }
      carouselItems.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [singlePreviewUrl, carouselItems])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
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

  const displayUrl = form.displayUrl || DEFAULT_FORM.displayUrl
  const ctaLabel = form.ctaLabel || DEFAULT_FORM.ctaLabel
  const pageName = form.pageName || DEFAULT_FORM.pageName
  const footerLinkLabel = ctaLabel === WHATSAPP_CTA_LABEL ? 'WHATSAPP' : displayUrl
  const activeCarouselItem = carouselItems[activeCarouselIndex] || carouselItems[0] || null
  const displayMediaItem =
    creativeType === 'carousel'
      ? activeCarouselItem
      : singlePreviewUrl
        ? { kind: creativeType === 'video' ? 'video' : 'image', url: singlePreviewUrl }
        : null

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

  const renderStoryMedia = () => {
    if (displayMediaItem?.kind === 'video') {
      return displayMediaItem?.url ? (
        <video className="story-media-content" src={displayMediaItem.url} muted playsInline controls />
      ) : (
        <div className="story-placeholder">No video selected</div>
      )
    }

    if (displayMediaItem?.url) {
      return (
        <img className="story-media-content" src={displayMediaItem.url} alt="Story creative preview" />
      )
    }

    return <div className="story-placeholder">No media selected</div>
  }

  const renderReelsMedia = () => {
    if (displayMediaItem?.kind === 'video' && displayMediaItem.url) {
      return (
        <video
          className="reels-media-content"
          src={displayMediaItem.url}
          muted
          playsInline
          controls
        />
      )
    }

    if (displayMediaItem?.url) {
      return <img className="reels-media-content" src={displayMediaItem.url} alt="Reels creative preview" />
    }

    return <div className="story-placeholder">No media selected</div>
  }

  return (
    <main className="app-shell">
      <section className="builder-panel">
        <div className="panel-header">
          <h1>Meta Ad Creative Preview</h1>
          <p>Upload ad materials and instantly preview feed + story placements.</p>
        </div>

        <div className="form-shell">
          <section className="form-section">
            <div className="section-heading">
              <h3>Campaign Setup</h3>
              <p>Basic ad identity shown in preview.</p>
            </div>
            <div className="form-grid">
              <label>
                Page Name
                <select name="pageName" value={form.pageName} onChange={handleInputChange}>
                  {PAGE_NAME_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Ad Name
                <input
                  name="campaignName"
                  value={form.campaignName}
                  onChange={handleInputChange}
                  placeholder="Summer Promo 2026"
                />
              </label>

              <label className="full-width">
                Destination URL
                <input
                  name="destinationUrl"
                  value={form.destinationUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.your-brand.com/offer"
                />
              </label>

              <label className="full-width">
                Display URL
                <select name="displayUrl" value={form.displayUrl} onChange={handleInputChange}>
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
              <p>Write the copy users see in feed and story.</p>
            </div>
            <div className="form-grid">
              <label className="full-width">
                Primary Text
                <textarea
                  name="primaryText"
                  value={form.primaryText}
                  onChange={handleInputChange}
                  rows="16"
                  placeholder="Tell people why they should click."
                />
              </label>

              <label>
                Headline
                <input
                  name="headline"
                  value={form.headline}
                  onChange={handleInputChange}
                  placeholder="Limited Time Offer"
                />
              </label>

              <label>
                Description
                <input
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Optional supporting line"
                />
              </label>

              <label className="full-width">
                CTA Button
                <select name="ctaLabel" value={form.ctaLabel} onChange={handleInputChange}>
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
        </div>
      </section>

      <section className="preview-panel">
        <h2>Facebook-Style Preview</h2>
        <div className="preview-layout">
          <article className="feed-preview fb-card">
            <header className="fb-header">
              <PageAvatar pageName={pageName} />
              <div>
                <h3 style={{ fontWeight: '600' }}>{pageName}</h3>
                <span className="fb-meta">
                  Ad <span className="fb-globe" aria-hidden="true">🌐</span>
                </span>
              </div>
              <div className="fb-header-actions" aria-hidden="true">
                <span>···</span>
                <span>×</span>
              </div>
            </header>

            <PrimaryTextPreview text={form.primaryText || DEFAULT_FORM.primaryText} />

            <div className="media-block">{renderMedia(mediaRatio.cssValue)}</div>

            <footer>
              <div>
                <small className={ctaLabel === WHATSAPP_CTA_LABEL ? 'footer-cta-type' : undefined}>
                  {footerLinkLabel}
                </small>
                <h4>{form.headline || DEFAULT_FORM.headline}</h4>
                {(form.description || DEFAULT_FORM.description) ? (
                  <p>{form.description || DEFAULT_FORM.description}</p>
                ) : null}
              </div>
              <CtaButton label={form.ctaLabel} />
            </footer>

            <FbEngagementBar />
          </article>

          <article className="story-preview preview-stack">
            <div className="story-phone">
              <p className="story-label">Story Placement</p>
              <div className="story-media">{renderStoryMedia()}</div>
              <div className="story-copy">
                <p>{form.headline || DEFAULT_FORM.headline}</p>
                <CtaButton label={form.ctaLabel} />
              </div>
            </div>

            <div className="reels-phone">
              <p className="story-label">Reels Placement (9:16)</p>
              <div className="reels-media">{renderReelsMedia()}</div>
              <div className="reels-overlay">
                <div className="reels-meta">
                  <strong>{pageName}</strong>
                  <p>{form.primaryText || DEFAULT_FORM.primaryText}</p>
                </div>
                <CtaButton label={form.ctaLabel} />
              </div>
            </div>

            <div className="ratio-preview-grid">
              {MEDIA_RATIOS.map((ratio) => (
                <div key={ratio.key} className="ratio-item">
                  <p>{ratio.key}</p>
                  <div className="ratio-box">
                    {displayMediaItem?.url ? (
                      displayMediaItem.kind === 'video' ? (
                        <video
                          style={{ '--media-ratio': ratio.cssValue }}
                          src={displayMediaItem.url}
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <img
                          style={{ '--media-ratio': ratio.cssValue }}
                          src={displayMediaItem.url}
                          alt={`Preview ${ratio.key}`}
                        />
                      )
                    ) : (
                      <div style={{ '--media-ratio': ratio.cssValue }} className="placeholder">
                        No media
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App

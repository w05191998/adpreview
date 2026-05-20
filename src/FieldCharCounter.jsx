import { getMetaCharCount, META_AD_HARD_LIMITS } from './metaAdLimits'

export default function FieldCharCounter({ fieldKey, value }) {
  const { max, label } = META_AD_HARD_LIMITS[fieldKey]
  const count = getMetaCharCount(value)
  const atLimit = count >= max

  return (
    <span
      className={`field-char-count${atLimit ? ' field-char-count--at-limit' : ''}`}
      title={`Meta maximum for ${label}: ${max} characters`}
    >
      {count} / {max}
    </span>
  )
}

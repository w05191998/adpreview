/**
 * Meta Ads Manager hard input limits for single image/video link ads (feed).
 * These are maximum characters accepted in Ads Manager / Marketing API — not
 * recommended visible lengths before truncation (125 / 40 / 25).
 *
 * Sources:
 * - Primary text (link_data.message): max 2,200 — Meta Instagram Ads API
 *   https://developers.facebook.com/docs/instagram/ads-api/reference/data-cta-requirements/
 * - Headline (link_data.name) & description (link_data.description): max 255 each —
 *   Meta single image/video ad fields (Ads Manager); see also Meta Business Help
 *   on truncation: https://www.facebook.com/business/help/223409425500940
 */
export const META_AD_HARD_LIMITS = {
  primaryText: {
    max: 2200,
    label: 'Primary text',
  },
  headline: {
    max: 255,
    label: 'Headline',
  },
  description: {
    max: 255,
    label: 'Description',
  },
}

export function getMetaCharCount(value) {
  return [...String(value || '')].length
}

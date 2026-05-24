const TRINITY_PAGE_NAME = 'Trinity Medical Centre 全仁醫務中心'
const TRINITY_AESTHETICS_PAGE_NAME = 'Trinity Medical Aesthetics 全仁醫學美容'
const TRINITY_BRAND_LOGO = '/trinity-fb-brand-logo.png'

const LANE_CRAWFORD_PAGE_NAME = 'Lane Crawford'
const LANE_CRAWFORD_BRAND_LOGO = '/lane-crawford-brand-logo.png'

export const CLIENTS = {
  trinity: {
    id: 'trinity',
    label: 'Trinity Medical Centre',
    brandLogo: TRINITY_BRAND_LOGO,
    pageNames: [TRINITY_PAGE_NAME, TRINITY_AESTHETICS_PAGE_NAME],
    displayUrls: ['trinitymedical.com.hk'],
    defaultPageName: TRINITY_PAGE_NAME,
    defaultDisplayUrl: 'trinitymedical.com.hk',
    defaultDestinationUrl: 'https://trinitymedical.com.hk/zh/e-shop/',
    fbBrandLogos: {
      [TRINITY_PAGE_NAME]: TRINITY_BRAND_LOGO,
      [TRINITY_AESTHETICS_PAGE_NAME]: '/trinity-aesthetics-logo.png',
    },
    igBrandLogos: {
      [TRINITY_PAGE_NAME]: TRINITY_BRAND_LOGO,
      [TRINITY_AESTHETICS_PAGE_NAME]: '/trinity-aesthetics-logo.png',
    },
    igPageHandles: {
      [TRINITY_PAGE_NAME]: 'trinitymedicalhongkong',
      [TRINITY_AESTHETICS_PAGE_NAME]: 'trinitymedicalaesthetics',
    },
    defaultIgHandle: 'trinitymedicalhongkong',
  },
  laneCrawford: {
    id: 'laneCrawford',
    label: 'Lane Crawford',
    fbBrandName: 'Lane Crawford',
    igBrandHandle: 'lanecrawford',
    brandLogo: LANE_CRAWFORD_BRAND_LOGO,
    pageNames: [LANE_CRAWFORD_PAGE_NAME],
    displayUrls: ['lanecrawford.com'],
    defaultPageName: LANE_CRAWFORD_PAGE_NAME,
    defaultDisplayUrl: 'lanecrawford.com',
    defaultDestinationUrl: 'https://www.lanecrawford.com/',
    fbBrandLogos: {
      [LANE_CRAWFORD_PAGE_NAME]: LANE_CRAWFORD_BRAND_LOGO,
    },
    igBrandLogos: {
      [LANE_CRAWFORD_PAGE_NAME]: LANE_CRAWFORD_BRAND_LOGO,
    },
    igPageHandles: {
      [LANE_CRAWFORD_PAGE_NAME]: 'lanecrawford',
    },
    defaultIgHandle: 'lanecrawford',
  },
}

const SESSION_KEY = 'adpreview-client-session'

export function listClients() {
  return Object.values(CLIENTS)
}

export function clientUsesPlatformHub(client) {
  return client?.id === 'laneCrawford'
}

const CLIENT_ACCESS_CODES = {
  trinity: {
    envKey: 'VITE_CLIENT_PASSWORD_TRINITY',
    defaultPassword: 'trinity',
  },
  laneCrawford: {
    envKey: 'VITE_CLIENT_PASSWORD_LANECRAWFORD',
    defaultPassword: 'lanecrawford',
  },
}

function getExpectedPassword(clientId) {
  const access = CLIENT_ACCESS_CODES[clientId]
  if (!access) {
    return ''
  }

  const fromEnv = import.meta.env[access.envKey]
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv
  }

  return access.defaultPassword
}

const ADMIN_PROFILES = [
  {
    profile: 'holly',
    envKey: 'VITE_CLIENT_PASSWORD_ADMIN_HOLLY',
    defaultPassword: 'adminholly',
  },
  {
    profile: 'standard',
    envKey: 'VITE_CLIENT_PASSWORD_ADMIN',
    defaultPassword: 'adminfabcom',
  },
]

function getAdminPasswordForProfile({ envKey, defaultPassword }) {
  const fromEnv = import.meta.env[envKey]
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv
  }

  return defaultPassword
}

function resolveAdminProfile(password) {
  const normalized = password.trim().toLowerCase()
  for (const entry of ADMIN_PROFILES) {
    const expected = getAdminPasswordForProfile(entry)
    if (expected && normalized === expected.toLowerCase()) {
      return entry.profile
    }
  }
  return null
}

/** @returns {{ kind: 'admin', adminProfile: string } | { kind: 'client', client: typeof CLIENTS.trinity } | null} */
export function authenticate(password) {
  const normalized = password.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  const adminProfile = resolveAdminProfile(password)
  if (adminProfile) {
    return { kind: 'admin', adminProfile }
  }

  for (const clientId of Object.keys(CLIENTS)) {
    const expected = getExpectedPassword(clientId)
    if (expected && normalized === expected.toLowerCase()) {
      return { kind: 'client', client: CLIENTS[clientId] }
    }
  }

  return null
}

export function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)

    if (parsed?.role === 'admin') {
      const activeClient = parsed.activeClientId ? CLIENTS[parsed.activeClientId] : null
      return {
        kind: 'admin',
        adminProfile: parsed.adminProfile || 'standard',
        activeClient: activeClient || null,
      }
    }

    const client = parsed?.clientId ? CLIENTS[parsed.clientId] : null
    if (client) {
      return { kind: 'client', client }
    }

    return null
  } catch {
    return null
  }
}

export function writeClientSession(client) {
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ role: 'client', clientId: client.id, at: Date.now() }),
  )
}

export function writeAdminSession(activeClientId = null, adminProfile = 'standard') {
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      role: 'admin',
      adminProfile,
      activeClientId: activeClientId || null,
      at: Date.now(),
    }),
  )
}

export function clearClientSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function getDraftStorageKey(clientId) {
  return `adpreview-draft-${clientId}-v1`
}

export function clearStoredDraft(clientId) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getDraftStorageKey(clientId))
}

export function clearAllStoredDrafts() {
  if (typeof window === 'undefined') {
    return
  }

  for (const client of listClients()) {
    clearStoredDraft(client.id)
  }

  window.localStorage.removeItem('adpreview-draft-v1')
}

export function getFacebookBrandName(pageName, client) {
  if (client.fbBrandName) {
    return client.fbBrandName
  }

  const normalizedName = pageName.trim()
  return normalizedName || client.defaultPageName
}

export function getInstagramHandle(pageName, client) {
  const normalizedName = pageName.trim()
  if (!normalizedName) {
    return client.defaultIgHandle
  }

  if (client.igPageHandles[normalizedName]) {
    return client.igPageHandles[normalizedName]
  }

  return client.defaultIgHandle
}

export function getInstagramBrandHandle(pageName, client) {
  if (client.igBrandHandle) {
    return client.igBrandHandle
  }

  return getInstagramHandle(pageName, client)
}

export function buildDefaultForm(client) {
  return {
    campaignName: '',
    pageName: client.defaultPageName,
    primaryText: '',
    headline: '',
    description: '',
    ctaLabel: '',
    destinationUrl: client.defaultDestinationUrl,
    displayUrl: client.defaultDisplayUrl,
  }
}

# Multi-client structure & setup

This app is a **Meta Ad Creative Preview** tool built for **Fabcom** to share with clients. Each client signs in with an access code and only sees their own presets (page names, display URLs, logos, default form values). Facebook and Instagram **feed mock UI** inside the preview cards is kept pixel-close to Meta; the surrounding builder/preview shell is Fabcom-branded.

---

## Project structure

```
adpreview/
├── public/                    # Static assets (client logos, favicon)
│   ├── trinity-fb-brand-logo.png
│   └── trinity-aesthetics-logo.png
├── src/
│   ├── main.jsx               # React entry
│   ├── index.css              # Global design tokens, motion
│   ├── App.jsx                # Main preview app + routing by session
│   ├── App.css                # Builder/preview shell styles (not FB/IG card internals)
│   ├── clientConfig.js        # ★ Client registry, auth, defaults
│   ├── ClientGate.jsx         # Login screen (Fabcom + access code)
│   ├── ClientGate.css
│   ├── AdminClientPicker.jsx  # Admin: pick which client workspace to open
│   └── assets/                # SVG icons for FB engagement bar only
├── docs/
│   └── CLIENTS.md             # This file
├── .env.example               # Password env var template
└── vite.config.js
```

### Key files

| File | Role |
|------|------|
| `clientConfig.js` | Single source of truth for all clients, passwords (via env), session helpers, draft storage keys |
| `ClientGate.jsx` | Password form; calls `authenticate()` |
| `AdminClientPicker.jsx` | Shown after admin login; lists all clients from `CLIENTS` |
| `App.jsx` | `App` → gate / picker / `AdPreviewApp`; form + FB/IG previews |
| `App.css` | Layout (split panel), compact header, placement chrome; `.feed-preview` / `.ig-feed-preview` = Meta mocks |

---

## Authentication flow

```
User opens app
    │
    ▼
readSession() in sessionStorage
    │
    ├─ no session ──► ClientGate (enter access code)
    │
    ├─ client session ──► AdPreviewApp (that client only)
    │
    └─ admin session ──► AdminClientPicker (if no client chosen yet)
                              │
                              ▼
                         AdPreviewApp + client dropdown + Sign out
```

### Access codes

| Code (dev default) | Role | Behaviour |
|--------------------|------|-----------|
| `trinity` | Client | Loads **Trinity** presets only; draft key `adpreview-draft-trinity-v1` |
| `adminholly` | Admin | Pick any client; switch client in header; Sign out |

Production passwords come from environment variables (see below). **Do not commit `.env`.**

### Session storage

- Key: `adpreview-client-session` in `sessionStorage` (cleared when the tab closes)
- Client: `{ role: 'client', clientId: 'trinity' }`
- Admin: `{ role: 'admin', activeClientId: 'trinity' \| null }`

### Draft storage (per client)

- Key pattern: `adpreview-draft-{clientId}-v1` in `localStorage`
- Switching clients (admin) or signing in as another client uses a **separate** draft key, so data does not mix.

---

## Client config shape

Each entry in `CLIENTS` in `src/clientConfig.js` looks like this:

```js
export const CLIENTS = {
  trinity: {
    id: 'trinity',                    // unique slug, used in storage keys & env var name
    label: 'Trinity Medical',         // shown in header badge
    brandLogo: '/trinity-fb-brand-logo.png',  // header + login picker (public/)
    pageNames: ['Page A', 'Page B'],  // Facebook page name dropdown
    displayUrls: ['example.com'],     // Display URL dropdown
    defaultPageName: 'Page A',
    defaultDisplayUrl: 'example.com',
    defaultDestinationUrl: 'https://example.com/',
    fbBrandLogos: { 'Page A': '/logo-a.png', 'Page B': '/logo-b.png' },
    igBrandLogos: { /* same keys as pageNames */ },
    igPageHandles: { 'Page A': 'handle_a', 'Page B': 'handle_b' },
    defaultIgHandle: 'handle_a',
  },
}
```

`pageNames` keys must match between `fbBrandLogos`, `igBrandLogos`, and `igPageHandles` when you use multiple pages.

---

## How to add a new client

### 1. Add logo files

Place images under `public/` (served at `/filename.png`):

```
public/acme-logo.png
```

### 2. Register the client in `clientConfig.js`

Copy the `trinity` block and adjust:

```js
const ACME_PAGE = 'Acme Corp'

export const CLIENTS = {
  trinity: { /* existing */ },
  acme: {
    id: 'acme',
    label: 'Acme Corp',
    brandLogo: '/acme-logo.png',
    pageNames: [ACME_PAGE],
    displayUrls: ['acme.com'],
    defaultPageName: ACME_PAGE,
    defaultDisplayUrl: 'acme.com',
    defaultDestinationUrl: 'https://acme.com/',
    fbBrandLogos: { [ACME_PAGE]: '/acme-logo.png' },
    igBrandLogos: { [ACME_PAGE]: '/acme-logo.png' },
    igPageHandles: { [ACME_PAGE]: 'acmecorp' },
    defaultIgHandle: 'acmecorp',
  },
}
```

No changes are required in `App.jsx` for a new client—the UI reads from `CLIENTS` automatically. Admin picker and admin header dropdown will include the new client.

### 3. Set a production password

In `.env` (copy from `.env.example`):

```env
VITE_CLIENT_PASSWORD_ACME=choose-a-strong-code
```

Naming rule: `VITE_CLIENT_PASSWORD_{CLIENT_ID_UPPERCASE}` → `acme` → `VITE_CLIENT_PASSWORD_ACME`.

Restart the dev server after changing `.env`.

### 4. (Optional) Dev-only fallback password

In `getExpectedPassword()` inside `clientConfig.js`, a `import.meta.env.DEV` block can mirror Trinity’s pattern for local testing only:

```js
if (import.meta.env.DEV && clientId === 'acme') {
  return 'acme'
}
```

Prefer env vars for anything shared outside your machine.

### 5. Share with the client

Give the client **only** their access code and URL. They will not see other clients’ page names or URLs in the UI.

---

## Admin access

| Env variable | Dev default |
|--------------|-------------|
| `VITE_CLIENT_PASSWORD_ADMIN` | `adminholly` |

Admins sign in → choose client → can switch client from the header dropdown. Each client’s drafts remain isolated by `clientId`.

---

## UI areas (what is client-specific vs shared)

| Area | Customisable per client? |
|------|-------------------------|
| Login (Fabcom branding) | Shared |
| Builder header (logo, badge, Sign out) | Client logo + label |
| Form dropdowns (page, display URL) | Client config only |
| Default form values on login | Client config |
| FB / IG feed card layout & styling | Shared Meta mock (same for all clients) |
| Preview panel placement labels | Shared |

To change **shell** styling: `App.css`, `index.css`, `ClientGate.css`.  
To change **feed mock** appearance: `.feed-preview`, `.ig-feed-preview` and related rules in `App.css` (affects all clients).

---

## Security notes

- Passwords are checked in the **browser** (Vite bundles env at build time). This is a **workflow gate**, not strong isolation against a technical user.
- Acceptable for internal/client preview tools when combined with:
  - Unique codes per client
  - Not exposing other clients’ options in the UI
  - Optional: separate deployed URLs per client (`trinity.preview.fabcom.com`, etc.)
- For stricter needs later: server-side auth, per-tenant API, or separate deployments per client.

---

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

---

## Checklist for a new client

- [ ] Logos in `public/`
- [ ] Entry added to `CLIENTS` in `clientConfig.js`
- [ ] `VITE_CLIENT_PASSWORD_{ID}` set in production `.env`
- [ ] Test client login: only that client’s pages/URLs/logos appear
- [ ] Test admin login: new client appears in picker and dropdown
- [ ] Confirm draft does not appear under another client’s `localStorage` key

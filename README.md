# zt-ui — ZeroTier Controller UI

A modern single-page interface for the ZeroTier controller HTTP API
(https://docs.zerotier.com/controller/). Networks, members, IP pools, DNS,
managed routes, capabilities/tags, and a structured flow-rules editor — all
client-side.

> **Stack** React 18 · Vite · TypeScript · Zustand · TanStack Query · Tailwind ·
> Radix Primitives · dnd-kit

---

## Quick start

```powershell
pnpm install
pnpm dev          # serves http://localhost:5173
```

Open the app. You will be redirected to `/connect`. Fill in:

- **Host** – `http://localhost:9993` (or `/zt` to use the bundled dev proxy)
- **Token** – contents of the controller's `authtoken.secret`:
  - Linux: `/var/lib/zerotier-one/authtoken.secret`
  - macOS: `/Library/Application Support/ZeroTier/One/authtoken.secret`
  - Windows: `%ProgramData%\ZeroTier\One\authtoken.secret`

Click **Test connection**. On success the dashboard becomes available.

```powershell
pnpm build        # production bundle in dist/
pnpm preview      # serve the built bundle
pnpm typecheck    # tsc --noEmit
```

---

## ⚠️ CORS — why direct browser access to :9993 fails

The ZeroTier controller does **not** emit `Access-Control-Allow-*` headers, so
no browser will let a SPA call it cross-origin even with a valid token. There
are three working setups:

### 1. Development (bundled Vite proxy)

`vite.config.ts` proxies `/zt/*` to `http://localhost:9993`. In the UI's
**Connect** page, set host to `/zt` and Vite will forward each request to the
controller while preserving the `X-ZT1-Auth` header. The default proxy target
is `http://localhost:9993`; override with:

```
VITE_DEV_PROXY_TARGET=http://192.168.1.10:9993 pnpm dev
```

### 2. Production: same-origin reverse proxy (recommended)

Serve the built `dist/` and the controller behind one origin. Example Caddy:

```caddyfile
zt.example.com {
    root * /srv/zt-ui/dist
    file_server
    try_files {path} /index.html

    @api path /controller* /status /unstable/controller*
    reverse_proxy @api 127.0.0.1:9993 {
        header_up X-Real-IP {remote_host}
    }
}
```

Example Nginx:

```nginx
server {
    listen 80;
    server_name zt.example.com;

    root /srv/zt-ui/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~ ^/(controller|status|unstable) {
        proxy_pass http://127.0.0.1:9993;
        proxy_set_header X-ZT1-Auth $http_x_zt1_auth;
    }
}
```

Then in the **Connect** page, set host to an empty string `""` or `/` — the API
client treats those as same-origin and sends requests to the proxied paths.

### 3. Anything else

Anything that gets the browser to the same origin works: an SSH tunnel, a
Tauri/Electron shell, a localhost-only nginx, etc. Adding a permissive CORS
middleware **in front of the controller** also works but widens the token's
exposure — only do it on a single-user host.

---

## What's in the UI

| Page                 | Highlights                                                                 |
|----------------------|----------------------------------------------------------------------------|
| Dashboard            | Node address, online state, controller DB status, network count.           |
| Networks             | List + create. NWID generation handled in two steps automatically.         |
| Network → Settings   | Name, MTU, multicast limit, broadcast, private, v4/v6 assign modes.        |
| Network → Members    | Table with one-click authorize, IP chips, drawer editor.                   |
| Network → IPs/Routes | Easy-fill from a CIDR, manual pool + route editing.                        |
| Network → DNS        | Managed search domain + server list.                                       |
| Network → Flow Rules | Structured cards per rule, `not` / `or` modifiers, drag to reorder,         |
|                      | templates, raw JSON view.                                                  |
| Network → Caps&Tags  | Tag definitions; capabilities with inner-rule JSON.                        |
| Network → Danger     | Type-to-confirm network deletion.                                          |

---

## Token security

Tokens are stored in `localStorage` (`zt-ui:auth`). Any code running on the
origin can read them — only run this UI from a trusted host. **Disconnect** in
the top bar clears the token.

---

## Limitations

- **rule-compiler text language** — not implemented. The editor produces and
  consumes the JSON rule shape the controller stores natively.
- **SSO / SAML** — controller-side fields are passed through but not edited.
- **Authoritative member counts** — at >500 members the per-member detail fetch
  may be slow (concurrency limited to 6). A future version will introduce a
  paginated list.
- **Schema drift** — unknown rule types and unknown network/member fields are
  preserved on save (passthrough), so newer controller features are not lost
  even before the UI surfaces them.

---

## Development notes

- File layout: see `src/` — each domain (`api`, `store`, `hooks`,
  `components/primitives`, `components/forms`, `components/rules`,
  `pages/tabs`) is split into small files.
- Server-state cache lives in TanStack Query. Zustand only stores client-owned
  state (`host`, `token`, sidebar collapse, toasts).
- All mutations invalidate the relevant query keys; no manual cache writes
  beyond the few `setQueryData` calls in `useUpsertMember` / `useUpdateNetwork`.

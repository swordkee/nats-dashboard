# AGENTS.md

Project agent instructions for Qwen Code.

## Project Overview

NATS Web Dashboard — a static web app (PWA) that displays live NATS server monitoring metrics in the browser. Built with Astro (SSG) + SolidJS (client-side UI) + TanStack Query (data fetching) + Tailwind CSS.

## Architecture

- **Astro** handles SSG: pages are pre-rendered at build time via `src/pages/[...path].astro`
- **SolidJS** handles all client-side interactivity via `client:only="solid-js"` (no SSR for the dashboard)
- **Solid Router** manages client-side navigation between pages
- **TanStack Query** polls NATS monitoring endpoints at configurable intervals

## Key Paths

| Path | Purpose |
|------|---------|
| `src/components/dashboard/App.tsx` | Solid Router entry point with all route definitions |
| `src/components/dashboard/Navigation.tsx` | Top navigation tabs |
| `src/components/dashboard/pages/` | Page components (Overview, Info, Connections, Routes, Gateways, LeafNodes, Accounts, AccountStats, Subscriptions, JetStream) |
| `src/components/dashboard/queries.ts` | TanStack Query hooks for all NATS monitoring endpoints |
| `src/lib/format.ts` | Data formatting functions (raw API → display-ready). Add new formatters here following existing patterns |
| `src/lib/info.ts` | `fetchInfo()` and `fetchStreamMessage()` — all API calls go through here |
| `src/lib/utils.ts` | Utility functions (formatBytes, abbreviateNum, formatDate, calculateRates, decodeBase64, etc.) |
| `src/types/` | TypeScript interfaces for all NATS monitoring API responses |
| `src/components/context/` | SolidJS context providers (Config, Store, Settings, Theme) |
| `src/components/dashboard/jetstream/` | JetStream-related components (streams, consumers, KV, messages) |
| `src/components/dashboard/server/` | Server info/stats/info-cards components |
| `src/components/dashboard/connections/` | Connection list and detail components |
| `src/pages/[...path].astro` | SSG entry — all routes must be listed in `getStaticPaths()` |

## Code Conventions

### SolidJS Components
- Use SolidJS primitives: `createSignal`, `createMemo`, `For`, `Show`, `Switch`/`Match`
- Use `createQuery` from `@tanstack/solid-query` for data fetching with polling
- Query hook pattern: `useXxx()` in `queries.ts`, accepts optional `() => Options` for reactive options
- Format raw API data in `format.ts`, not in components

### UI Components
- Use project components: `Modal`, `SlideOver`, `DataCard`, `Badge`, `Button`, `Tabs`/`Tab`/`TabPanel`, `StackedList*`
- **Never** create inline `fixed inset-0 z-50` modal divs — always use the `Modal` component (Portal + Transition + clickOutside)
- Detail views: use `SlideOver` for sidebar panels, `Modal` for centered dialogs

### Data Formatting
- All formatting goes through `src/lib/format.ts`
- Follow the `FormattedXxx` interface pattern: extends `Omit<Partial<RawType>, 'field'>` to override sub-types
- Use `formatBytes()`, `abbreviateNum()`, `formatDuration()`, `formatRTT()`, `formatDate()`, `formatDistance()` from `~/lib/utils`
- `formatDate()` defaults to UTC — do not pass `'UTC'` explicitly

### Type Safety
- NATS API types live in `src/types/` and are re-exported from `src/types/index.ts`
- `StreamMessagesResponse` is a union of `StreamMessagesListResponse` (has `messages` array), `StreamMessageGetResponse` (has `message` object), and `StreamMessageErrorResponse` (has `error`). Use `extractMessages()` helper to get messages array from response
- The NATS messages API returns `{ messages: [...] }` wrapper, NOT a bare array
- With `exactOptionalPropertyTypes: true` in tsconfig, use spread `...(val !== undefined && { key: val })` for optional fields instead of direct assignment
- Optional props in interfaces that can be `undefined` must include `| undefined` in the type: `sparkline?: Accessor<number[]> | undefined`

### Adding a New Page
1. Create page component in `src/components/dashboard/pages/`
2. Add query hook in `queries.ts` + formatter in `format.ts` + types in `src/types/`
3. Register route in `App.tsx` (`<Route path="/..." component={...} />`)
4. Add nav link in `Navigation.tsx`
5. Add static path in `src/pages/[...path].astro` `getStaticPaths()`
6. Run `npx tsc --noEmit` and `npm run build` to verify

### Styling
- Tailwind CSS only — no CSS modules or styled-components
- Dark mode: use `dark:` variants (class-based via `<html class="dark">`)
- Tables: `min-w-full divide-y divide-gray-200 dark:divide-gray-700` with `bg-gray-50 dark:bg-gray-800` thead
- DataCard for key-value displays, StackedList for list views

## Build & Verify

```bash
npx tsc --noEmit   # Type check (fast, no build)
npm run build      # Full build: astro check + tsc + astro build + service worker
npm test           # Vitest unit tests
```

## Environment Notes

- Node version: see `.nvmrc` (currently 22.0)
- If switching between Windows and WSL, delete `node_modules/` and `package-lock.json` and re-run `npm install` from the target platform
- Do NOT add `@rollup/rollup-*` to `package.json` — it's an optional dependency of rollup and should resolve automatically

## NATS Monitoring API Reference

All endpoints are polled from the browser directly. Base URL is user-configurable.

| Endpoint | Type | Query Hook | Formatter |
|----------|------|-----------|-----------|
| `varz` | General info | `useVarz()` | `formatVarz()` |
| `connz` | Connections | `useConnz()` | `formatConnz()` |
| `routez` | Routes | `useRoutez()` | `formatRoutez()` |
| `gatewayz` | Gateways | `useGatewayz()` | `formatGatewayz()` |
| `leafz` | Leaf nodes | `useLeafz()` | `formatLeafz()` |
| `accountz` | Accounts | `useAccountz()` | `formatAccountz()` |
| `accstatz` | Account stats | `useAccstatz()` | `formatAccountStatz()` |
| `subsz` | Subscriptions | `useSubsz()` | `formatSubsz()` |
| `jsz` | JetStream | `useJsz()` | `formatJsz()` |
| `jsz/assets/{stream}/stream/messages` | Stream messages | `createQuery()` inline | N/A (handled in component) |

# TODO

- [ ] Add page to create WebSocket clients that publish and subscribe to subjects

# Non Essential Fixes

- [ ] Menu sidebar close button transition (`solid-transition-group` Does not support child animations)
- [ ] Remove `Modal`/`SlideOver`/`MobileSidebar` components exit animation workaround (Depends on `solid-transition-group`)
- [ ] Fix `clickOutside` directive not recognized by TypeScript that it's being used (Currently preserving the import by referencing the import)

# Completed

- [x] Fix inconsistent date formatting — `formatDate()` now defaults to UTC for all timestamps
- [x] Display cluster info — Cluster and Gateway cards added to Info page
- [x] Sorting options for streams — Sort by Name, Created, Consumers, Messages, Data Size, Subjects
- [x] Accounts page — Account list with detail expansion and sublist stats
- [x] Account stats page — Per-account connection/traffic/slow consumer statistics
- [x] Routes page — Route list with detail slide-over
- [x] Gateways page — Outbound/inbound gateway status and account info
- [x] Leaf nodes page — Leaf node list with detail slide-over
- [x] Subscriptions page — Subscription list with sublist stats overview
- [x] Health Check — `useHealthz` hook + health indicator on Overview page (green/red/yellow)
- [x] Meta Cluster — Info page + JetStream page display meta_cluster topology with replica table
- [x] Replica Details — Stream/Consumer detail views show per-replica health (current/offline/active/lag)
- [x] Sparkline Trends — SVG sparkline charts on Overview page for CPU, memory, connections, rates, etc.
- [x] OCSP Peer Cache — Info page shows OCSP response cache stats
- [x] Trusted Operators — Info page shows operator JWTs and claims
- [x] Stream sort persistence — Sort field stored in localStorage via SettingsProvider
- [x] Fix MessageViewer/KVStoreBrowser — API response now correctly handles `{ messages: [...] }` wrapper

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

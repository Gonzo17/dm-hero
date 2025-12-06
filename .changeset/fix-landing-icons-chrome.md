---
"@dm-hero/landing": patch
---

fix(landing): fix MDI icons visibility in Chrome, optimize screenshot loading

- Fix hero stats icons not showing in Chrome (gradient-text CSS incompatibility)
- Use gold color (#ffd700) for stat icons that matches gradient text
- Replace dynamic screenshot detection (99 HEAD requests) with static file paths
- Add vuetify/styles import to plugin for proper styling

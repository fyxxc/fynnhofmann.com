# Upload Guide – komplette neue Struktur

Diese Version wurde vollständig neu geschrieben und nutzt überall dasselbe neue CSS-System.

## Seiten
- `/` (Portfolio)
- `/login.html` (Admin Login)
- `/app/` (Dashboard)
- `/app/wishlist.html`
- `/maintenance/`
- `/401.html`
- `/403.html`
- `/404.html`
- `/500.html`
- `/502.html`
- `/503.html`

## Kernfunktionen (beibehalten)
- Supabase Login mit Redirect in den Admin-Bereich
- Session-Checks in Dashboard und Wishlist
- Maintenance-Check über `config.json`
- Wartungsmodus-Toggle im Dashboard
- URL-Inhaltsverzeichnis im Dashboard
- Wishlist CRUD (Insert + Laden)

## Upload-Dateien
- `index.html`
- `login.html`
- `app/index.html`
- `app/wishlist.html`
- `maintenance/index.html`
- `assets/css/main.css`
- `assets/js/login.js`
- `assets/js/dashboard.js`
- `assets/js/wishlist.js`
- `assets/js/maintenance.js`
- `config.json`
- `401.html`, `403.html`, `404.html`, `500.html`, `502.html`, `503.html`

## Wichtig
Beim Upload die Ordnerstruktur exakt beibehalten.

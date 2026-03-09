# fynnhofmann.com

Persönliche Website von Fynn Hofmann.

## Tech-Stack

- **Reines HTML, CSS & JavaScript** – kein Framework, kein Build-Tool
- **Apple-inspiriertes Design-System** mit CSS-Variablen (`styles.css`)
- **Hosting:** Cloudflare Pages
- **DNS & CDN:** Cloudflare
- **Serverless Endpunkte:** Cloudflare Workers

## Projektstruktur

```
/
├── index.html            – Startseite
├── login.html            – Admin-Login (SHA-256, sessionStorage)
│
├── styles.css            – Globales Design-System (CSS-Variablen, Komponenten)
├── script.js             – Scroll-Reveal, Mobile-Nav, Easter Eggs
├── components.js         – Shared Header & Footer (JS-Injection)
│
├── images/
│   ├── favicon.svg
│   ├── hero.jpeg
│   └── Threema_QR-Code.jpeg
│
├── pages/                – Öffentliche Unterseiten
│   ├── erfahrung.html    – Berufserfahrung & Ausbildung
│   ├── projekte.html     – Projekte
│   ├── kontakt.html      – Kontakt & Threema
│   ├── impressum.html    – Impressum & Domains
│   └── beruf.html        – Redirect → erfahrung.html
│
├── tools/                – Browser-Tools & Spiele
│   ├── qr/               – QR-Code-Generator
│   ├── spiel/            – Soccer Slime (Spiel)
│   ├── orbit/            – Gravity Sandbox (Simulation)
│   └── tipper/           – Tipp-Geschwindigkeitstest
│
├── secure/               – Auth-geschützter Bereich
│   ├── auth.js           – Auth-Guard (muss als erstes im <head> stehen)
│   ├── index.html        – Dashboard
│   └── network_v2.html   – Netzwerk-Topologie
│
└── servicenow/           – NovaTech ServiceNow Partner-Website
    ├── styles.css
    ├── auth.js
    └── *.html
```

## Header & Footer

Header und Footer werden von `components.js` per JavaScript in jede Seite injiziert.
Jede `<html>`-Tag hat ein `data-base`-Attribut zur Pfadauflösung:

| Ebene | `data-base` | Beispiel |
|---|---|---|
| Root (`/`) | `""` | `index.html` |
| `pages/` | `"../"` | `pages/erfahrung.html` |
| `tools/[x]/` | `"../../"` | `tools/qr/index.html` |

**Ladereihenfolge:** `components.js` muss **vor** `script.js` geladen werden, damit die injizierten IDs (`navBurger`, `navMobile` etc.) beim Initialisieren bereits im DOM vorhanden sind.

## Interaktive Seiten & Tools

| Pfad | Beschreibung |
|---|---|
| `/tools/qr/` | QR-Code-Generator – URLs, Text & vCard, lokal im Browser |
| `/tools/spiel/` | Soccer Slime – browserbasiertes Spiel |
| `/tools/orbit/` | Gravity Sandbox – N-Body-Gravitationssimulation auf Canvas |
| `/tools/tipper/` | Tipp-Test – Schreibgeschwindigkeit (WPM) messen |

Alle Tools laufen vollständig **serverless** im Browser. Es werden keine Nutzerdaten übertragen oder gespeichert (ausgenommen lokale `localStorage`-Highscores im Tipp-Test).

## Lokale Entwicklung

Da es kein Build-System gibt, reicht ein einfacher lokaler HTTP-Server:

```bash
# Python (überall verfügbar)
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
Live Server Extension (Go Live)
```

Dann im Browser: `http://localhost:8080`

## Design-System

Alle Design-Tokens sind in `styles.css` als CSS-Variablen definiert:

```css
--accent:         #0071e3   /* Apple-Blau */
--text:           #1d1d1f
--text-secondary: #6e6e73
--bg-light:       #f5f5f7
--radius:         18px
--font:           -apple-system, SF Pro, Inter, …
```

## Deployment

Push auf `main` → Cloudflare Pages baut und deployt automatisch.
Keine Build-Schritte – die Dateien werden direkt ausgeliefert.

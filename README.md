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
├── erfahrung.html        – Berufserfahrung
├── projekte.html         – Projekte
├── kontakt.html          – Kontakt
├── impressum.html        – Impressum & Domains
├── beruf.html            – Redirect → erfahrung.html
│
├── styles.css            – Globales Design-System (CSS-Variablen, Komponenten)
├── script.js             – Scroll-Reveal, Mobile-Nav, Easter Eggs
├── components.js         – Shared Header & Footer (JS-Injection)
│
├── images/
│   ├── hero.jpeg
│   └── Threema_QR-Code.jpeg
│
├── qr/
│   └── index.html        – QR-Code-Generator (Tool)
├── spiel/
│   └── index.html        – Soccer Slime (Spiel)
├── orbit/
│   └── index.html        – Gravity Sandbox (Simulation)
└── tipper/
    └── index.html        – Tipp-Geschwindigkeitstest (Tool)
```

## Header & Footer

Header und Footer werden von `components.js` per JavaScript in jede Seite injiziert.
Jede `<html>`-Tag hat ein `data-base`-Attribut, das `components.js` nutzt, um Pfade korrekt aufzulösen:

- Root-Seiten: `data-base=""`
- Unterordner-Seiten: `data-base="../"`

**Ladereihenfolge:** `components.js` muss **vor** `script.js` geladen werden, damit die injizierten IDs (`navBurger`, `navMobile` etc.) beim Initialisieren von `script.js` bereits im DOM vorhanden sind.

## Interaktive Seiten & Tools

| Pfad | Beschreibung |
|---|---|
| `/qr/` | QR-Code-Generator – URLs, Text & vCard, lokal im Browser |
| `/spiel/` | Soccer Slime – browserbasiertes Spiel |
| `/orbit/` | Gravity Sandbox – N-Body-Gravitationssimulation auf Canvas |
| `/tipper/` | Tipp-Test – Schreibgeschwindigkeit (WPM) messen |

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

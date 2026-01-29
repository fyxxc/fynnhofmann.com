const ua = navigator.userAgent;

const browser =
  ua.includes("Firefox") ? "Browser: Firefox" :
  ua.includes("Edg") ? "Browser: Edge" :
  ua.includes("Chrome") ? "Browser: Chrome" :
  ua.includes("Safari") ? "Browser: Safari" :
  "Browser: Unbekannt";

const os =
  ua.includes("Win") ? "OS: Windows" :
  ua.includes("Mac") ? "OS: macOS" :
  ua.includes("Linux") ? "OS: Linux" :
  "OS: Unbekannt";

document.getElementById("browser").innerText = browser;
document.getElementById("os").innerText = os;
document.getElementById("lang").innerText = "Sprache: " + navigator.language;
document.getElementById("res").innerText =
  `Auflösung: ${window.screen.width}×${window.screen.height}`;

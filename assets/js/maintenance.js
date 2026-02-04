/* ============================= */
/* TIME + TIMEZONE               */
/* ============================= */

const now = new Date();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const timeString = now.toLocaleTimeString("de-CH", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

document.getElementById("time").textContent =
  `Uhrzeit (${timezone}): ${timeString}`;


/* ============================= */
/* BROWSER + VERSION             */
/* ============================= */

function getBrowser() {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox/")) {
    return "Firefox " + ua.match(/Firefox\/([\d.]+)/)[1];
  }

  if (ua.includes("Edg/")) {
    return "Edge " + ua.match(/Edg\/([\d.]+)/)[1];
  }

  if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    return "Chrome " + ua.match(/Chrome\/([\d.]+)/)[1];
  }

  if (ua.includes("Safari/") && ua.includes("Version/")) {
    return "Safari " + ua.match(/Version\/([\d.]+)/)[1];
  }

  return navigator.userAgent;
}

document.getElementById("browser").textContent =
  `Browser: ${getBrowser()}`;


/* ============================= */
/* OS + VERSION (BEST EFFORT)    */
/* ============================= */

function getOS() {
  const ua = navigator.userAgent;

  if (ua.includes("Windows NT 10.0")) return "Windows 10/11";
  if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
  if (ua.includes("Windows NT 6.1")) return "Windows 7";

  if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) {
      return "macOS " + match[1].replaceAll("_", ".");
    }
    return "macOS";
  }

  if (ua.includes("Android")) {
    const match = ua.match(/Android ([\d.]+)/);
    if (match) return "Android " + match[1];
    return "Android";
  }

  if (ua.includes("iPhone OS")) {
    const match = ua.match(/OS ([\d_]+)/);
    if (match) return "iOS " + match[1].replaceAll("_", ".");
    return "iOS";
  }

  if (ua.includes("Linux")) return "Linux";

  return navigator.platform;
}

document.getElementById("os").textContent =
  `Betriebssystem: ${getOS()}`;


/* ============================= */
/* IPV4 (PUBLIC IP)              */
/* ============================= */

fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    document.getElementById("ip").textContent =
      `ipv4 Adresse: ${data.ip}`;
  })
  .catch(() => {
    document.getElementById("ip").textContent =
      `ipv4 Adresse: nicht verfügbar`;
  });

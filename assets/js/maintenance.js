const timeEl = document.getElementById("time");
const browserEl = document.getElementById("browser");
const osEl = document.getElementById("os");
const ipEl = document.getElementById("ip");

const now = new Date();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeString = now.toLocaleTimeString("de-CH", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

if (timeEl) timeEl.textContent = `Uhrzeit (${timezone}): ${timeString}`;
if (browserEl) browserEl.textContent = `Browser: ${getBrowser()}`;
if (osEl) osEl.textContent = `Betriebssystem: ${getOS()}`;

if (ipEl) {
  fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => {
      ipEl.textContent = `ipv4 Adresse: ${data.ip}`;
    })
    .catch(() => {
      ipEl.textContent = "ipv4 Adresse: nicht verfügbar";
    });
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] ?? ""}`.trim();
  if (ua.includes("Edg/")) return `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1] ?? ""}`.trim();
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] ?? ""}`.trim();
  if (ua.includes("Safari/") && ua.includes("Version/")) return `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] ?? ""}`.trim();
  return "Unbekannt";
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows NT 10.0")) return "Windows 10/11";
  if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
  if (ua.includes("Windows NT 6.1")) return "Windows 7";
  if (ua.includes("Mac OS X")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone OS")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unbekannt";
}

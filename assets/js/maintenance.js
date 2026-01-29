const ua = navigator.userAgent;

function getBrowser() {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannter Browser";
}

function getOS() {
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Linux")) return "Linux";
  return "Unbekanntes OS";
}

document.getElementById("browser").textContent = getBrowser();
document.getElementById("os").textContent = getOS();
document.getElementById("time").textContent =
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

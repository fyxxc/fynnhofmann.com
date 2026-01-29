import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* 🔐 EINMAL HIER EINTRAGEN */
const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

/* 🔒 BLOCKIERENDER AUTH-CHECK */
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.replace("/login.html");
}

/* 👋 Begrüssung */
document.getElementById("welcome").textContent =
  "Willkommen im geschützten Bereich.";

/* 👤 User */
document.getElementById("user-email").textContent =
  session.user.email;

/* 🕒 Session */
document.getElementById("session-status").textContent =
  "Aktiv";

/* 🕒 Letzter Login */
document.getElementById("last-login").textContent =
  new Date(session.user.last_sign_in_at).toLocaleString();

/* 🌍 Umgebung */
const ua = navigator.userAgent;
const browser =
  ua.includes("Firefox") ? "Firefox" :
  ua.includes("Edg") ? "Edge" :
  ua.includes("Chrome") ? "Chrome" :
  ua.includes("Safari") ? "Safari" :
  "Unbekannt";

const os =
  ua.includes("Win") ? "Windows" :
  ua.includes("Mac") ? "macOS" :
  ua.includes("Linux") ? "Linux" :
  "Unbekannt";

document.getElementById("environment").textContent =
  `${browser} / ${os}`;

/* 🚪 Logout */
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.replace("/login.html");
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* 🔐 Supabase */
const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

/* 🔎 Session prüfen */
const { data: { session } } = await supabase.auth.getSession();

/* ❌ NICHT eingeloggt → nichts tun
   Die HTML-Nachricht bleibt sichtbar */
if (!session) {
  console.log("Nicht angemeldet");
  return;
}

/* ✅ EINGELOGGT → Inhalt ERSETZEN */
const container = document.querySelector(".container");

container.innerHTML = `
  <div class="site-name">fynnhofmann.com</div>

  <h1>Dashboard</h1>
  <p>
    Angemeldet als <strong>${session.user.email}</strong>
  </p>

  <div class="dashboard-grid">

    <div class="card">
      <h3>Status</h3>
      <p>Angemeldet</p>
    </div>

    <div class="card">
      <h3>Letzter Login</h3>
      <p>${new Date(session.user.last_sign_in_at).toLocaleString()}</p>
    </div>

    <div class="card">
      <h3>Browser</h3>
      <p>${getBrowser()}</p>
    </div>

    <div class="card">
      <h3>Betriebssystem</h3>
      <p>${getOS()}</p>
    </div>

  </div>

  <button id="logout">Abmelden</button>
`;

/* 🚪 Logout */
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

/* 🔧 Helfer */
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannt";
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unbekannt";
}

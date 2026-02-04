import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const container = document.querySelector(".page-content");

// 1️⃣ Sofort prüfen (für Reloads)
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  renderDashboard(session);
}

// 2️⃣ AUF LOGIN-STATE HÖREN (DAS WAR DER FEHLENDE TEIL)
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    renderDashboard(session);
  }
});

// 3️⃣ Dashboard rendern
function renderDashboard(session) {
  container.innerHTML = `
    <div class="site-name">fynnhofmann.com</div>

    <h1>Dashboard</h1>
    <p>Angemeldet als <strong>${session.user.email}</strong></p>

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

  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });
}

// Helfer
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannt";
}

function getOS() {
  if (navigator.userAgent.includes("Win")) return "Windows";
  if (navigator.userAgent.includes("Mac")) return "macOS";
  if (navigator.userAgent.includes("Linux")) return "Linux";
  return "Unbekannt";
}

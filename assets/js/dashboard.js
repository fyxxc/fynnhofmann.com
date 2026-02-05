import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===== Maintenance Check ===== */
async function checkMaintenance() {
  try {
    const res = await fetch("/config.json?cache=" + Date.now());
    const cfg = await res.json();

    if (cfg.maintenance === true) {
      window.location.href = "/maintenance/";
      return true;
    }
  } catch (e) {
    console.warn("Maintenance check failed");
  }
  return false;
}

const maintenanceActive = await checkMaintenance();
if (maintenanceActive) {
  throw new Error("Maintenance active");
}

let rendered = false;

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

/* ===== Container holen (neues Layout) ===== */
const container = document.querySelector(".page-content");

if (!container) {
  console.error("page-content nicht gefunden");
}

/* ===== Session sofort prüfen ===== */
const { data: { session } } = await supabase.auth.getSession();


/* Wenn Session vorhanden → Dashboard rendern */
if (session) {
  renderDashboard(session);
}

/* ===== Auf Auth-State hören (Login / Reload) ===== */
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    renderDashboard(session);
  }
});

/* ===== Dashboard rendern ===== */
function renderDashboard(session) {
    if (rendered) return;
    rendered = true;
  container.innerHTML = `
    <div class="site-name">fynnhofmann.com</div>

    <h1>Dashboard</h1>
    <p>Angemeldet als <strong>${session.user.email}</strong></p>

    <div class="dashboard-grid">

      <div class="card">
        <h3>Cloudflare</h3>
        <a href="https://dash.cloudflare.com" target="_blank">Öffnen</a>
      </div>

      <div class="card">
        <h3>GitHub</h3>
        <a href="https://github.com" target="_blank">Öffnen</a>
      </div>

      <div class="card">
        <h3>Supabase</h3>
        <a href="https://supabase.com/dashboard" target="_blank">Console</a>
      </div>

      <div class="card">
        <h3>Maintenance Mode</h3>
        <button id="toggleMaintenance">Toggle Wartung</button>
      </div>

      <div class="card">
        <h3>Letzter Login</h3>
        <p>${new Date(session.user.last_sign_in_at).toLocaleString()}</p>
      </div>

      <div class="card">
        <h3>Browser</h3>
        <p>${getBrowser()}</p>
      </div>

    </div>


    <button id="logout">Abmelden</button>
  `;

  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  });
}

/* ===== Helfer ===== */
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

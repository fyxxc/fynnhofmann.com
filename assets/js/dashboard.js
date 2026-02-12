import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let rendered = false;
const RECRUITER_KEY = "recruiterPortalEnabled";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const content = document.getElementById("dashboard-content");
const title = document.getElementById("dashboard-title");
const text = document.getElementById("dashboard-text");
const notice = document.getElementById("admin-notice");
const authGate = document.getElementById("auth-gate");

if (!content) {
  console.error("dashboard-content nicht gefunden");
}

const { data: { session } } = await supabase.auth.getSession();
if (session) {
  renderDashboard(session);
}

supabase.auth.onAuthStateChange((_event, nextSession) => {
  if (nextSession) {
    renderDashboard(nextSession);
  }
});

function isRecruiterEnabled() {
  const current = localStorage.getItem(RECRUITER_KEY);
  if (current === null) {
    localStorage.setItem(RECRUITER_KEY, "true");
    return true;
  }
  return current === "true";
}

function setRecruiterEnabled(value) {
  localStorage.setItem(RECRUITER_KEY, String(value));
}

function renderDashboard(activeSession) {
  if (rendered || !content) return;
  rendered = true;

  if (title) title.textContent = "Admin Dashboard";
  if (text) {
    text.textContent = "Verwaltung für Wartung, Recruiter-Zugang und Systemlinks.";
  }
  if (notice) notice.hidden = true;
  if (authGate) authGate.hidden = true;

  const recruiterEnabled = isRecruiterEnabled();

  content.innerHTML = `
    <article class="app-card">
      <h3>Account</h3>
      <p>Angemeldet als <strong>${activeSession.user.email}</strong></p>
      <p>Letzter Login: ${new Date(activeSession.user.last_sign_in_at).toLocaleString()}</p>
    </article>

    <article class="app-card">
      <h3>Recruiter-Bereich</h3>
      <p>Status: <strong id="recruiter-status">${recruiterEnabled ? "Aktiv" : "Deaktiviert"}</strong></p>
      <p>Du kannst den Zugang hier zentral ein- oder ausschalten.</p>
      <button id="toggleRecruiter" class="button-secondary" type="button">${recruiterEnabled ? "Recruiter deaktivieren" : "Recruiter aktivieren"}</button>
      <a href="/recruiter/">Recruiter Bereich öffnen</a>
    </article>

    <article class="app-card">
      <h3>Wartungsmodus</h3>
      <p>Setzt die globale Wartungsseite für Besucher.</p>
      <button id="toggleMaintenance" class="button-secondary" type="button">Wartung umschalten</button>
    </article>

    <article class="app-card">
      <h3>Tools</h3>
      <ul class="link-list">
        <li><a href="/app/wishlist">Wishlist</a></li>
        <li><a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">Cloudflare</a></li>
        <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
        <li><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase</a></li>
      </ul>
    </article>

    <article class="app-card app-card-full">
      <h3>Sitzung</h3>
      <p>Browser: ${getBrowser()}</p>
      <button id="logout" type="button">Abmelden</button>
    </article>
  `;

  document.getElementById("logout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  });

  document.getElementById("toggleMaintenance")?.addEventListener("click", toggleMaintenance);

  document.getElementById("toggleRecruiter")?.addEventListener("click", () => {
    const newValue = !isRecruiterEnabled();
    setRecruiterEnabled(newValue);

    const statusNode = document.getElementById("recruiter-status");
    if (statusNode) {
      statusNode.textContent = newValue ? "Aktiv" : "Deaktiviert";
    }

    const toggleBtn = document.getElementById("toggleRecruiter");
    if (toggleBtn) {
      toggleBtn.textContent = newValue ? "Recruiter deaktivieren" : "Recruiter aktivieren";
    }
  });
}

async function toggleMaintenance() {
  const { data } = await supabase
    .from("site_config")
    .select("maintenance")
    .eq("id", 1)
    .single();

  const newValue = !data.maintenance;

  await supabase
    .from("site_config")
    .update({ maintenance: newValue })
    .eq("id", 1);

  const statusText = newValue ? "aktiv" : "deaktiviert";
  if (notice) {
    notice.hidden = false;
    notice.innerHTML = `<h2>Wartungsmodus</h2><p>Wartungsmodus ist jetzt <strong>${statusText}</strong>.</p>`;
  }
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannt";
}

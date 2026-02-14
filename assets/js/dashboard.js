import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let rendered = false;

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const content = document.getElementById("dashboard-content");
const dashboardText = document.getElementById("dashboard-text");

const quickLinks = [
  { label: "Startseite", url: "/" },
  { label: "Login", url: "/login.html" },
  { label: "Maintenance", url: "/maintenance/" },
  { label: "Wishlist", url: "/app/wishlist.html" },
  { label: "404", url: "/404.html" },
  { label: "401", url: "/401.html" },
  { label: "403", url: "/403.html" },
  { label: "500", url: "/500.html" },
  { label: "502", url: "/502.html" },
  { label: "503", url: "/503.html" }
];

init();

async function init() {
  const session = await getStableSession();

  if (!session) {
    window.location.replace("/login.html");
    return;
  }

  renderDashboard(session);

  supabase.auth.onAuthStateChange((_event, changedSession) => {
    if (!changedSession) {
      window.location.replace("/login.html");
      return;
    }
    renderDashboard(changedSession);
  });
}

async function getStableSession() {
  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

function renderDashboard(session) {
  if (!content || rendered) return;
  rendered = true;

  dashboardText.textContent = `Angemeldet als ${session.user.email}`;

  const urlRows = quickLinks
    .map((link) => `<li><strong>${link.label}</strong> <a href="${link.url}" target="_blank" rel="noreferrer">${link.url}</a></li>`)
    .join("");

  content.innerHTML = `
    <article class="card card-accent dashboard-card">
      <h2>Schnellzugriff</h2>
      <div class="contact-links">
        <a href="/app/wishlist.html">Wishlist</a>
        <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">Cloudflare</a>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase</a>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </article>

    <article class="card card-dark dashboard-card">
      <h2>System</h2>
      <p>Letzter Login: ${new Date(session.user.last_sign_in_at).toLocaleString("de-DE")}</p>
      <p>Browser: ${getBrowser()}</p>
      <button id="toggleMaintenance">Wartungsmodus umschalten</button>
      <button id="logout">Abmelden</button>
    </article>

    <article class="card card-light dashboard-card url-index-card">
      <h2>Inhaltsverzeichnis (URLs)</h2>
      <ul>${urlRows}</ul>
    </article>
  `;

  document.getElementById("logout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.replace("/login.html");
  });

  document.getElementById("toggleMaintenance")?.addEventListener("click", toggleMaintenance);
}

async function toggleMaintenance() {
  const { data } = await supabase
    .from("site_config")
    .select("maintenance")
    .eq("id", 1)
    .single();

  const newValue = !data?.maintenance;

  const { error } = await supabase
    .from("site_config")
    .update({ maintenance: newValue })
    .eq("id", 1);

  if (error) {
    alert("Wartungsmodus konnte nicht geändert werden.");
    return;
  }

  alert(`Maintenance ist jetzt: ${newValue}`);
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannt";
}

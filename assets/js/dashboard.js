import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const dashboardText = document.getElementById("dashboard-text");
const dashboardContent = document.getElementById("dashboard-content");

const quickLinks = [
  { label: "Startseite", url: "/" },
  { label: "Login", url: "/login.html" },
  { label: "Maintenance", url: "/maintenance/" },
  { label: "Dashboard", url: "/app/" },
  { label: "Wishlist", url: "/app/wishlist.html" },
  { label: "401", url: "/401.html" },
  { label: "403", url: "/403.html" },
  { label: "404", url: "/404.html" },
  { label: "500", url: "/500.html" },
  { label: "502", url: "/502.html" },
  { label: "503", url: "/503.html" }
];

const session = await waitForSession();
if (!session) {
  window.location.replace("/login.html");
} else {
  renderDashboard(session);
}

supabase.auth.onAuthStateChange((_event, changedSession) => {
  if (!changedSession) {
    window.location.replace("/login.html");
    return;
  }
  renderDashboard(changedSession);
});

function renderDashboard(session) {
  if (!dashboardContent) return;

  dashboardText.textContent = `Angemeldet als ${session.user.email}`;

  const linkList = quickLinks
    .map((item) => `<li><strong>${item.label}:</strong> <a href="${item.url}" target="_blank" rel="noreferrer">${item.url}</a></li>`)
    .join("");

  dashboardContent.innerHTML = `
    <article class="panel panel-dark">
      <h2>Schnellzugriff</h2>
      <div class="link-row">
        <a href="/app/wishlist.html">Wishlist</a>
        <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">Cloudflare</a>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase</a>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </article>

    <article class="panel panel-magenta">
      <h2>System</h2>
      <p><strong>Letzter Login:</strong> ${new Date(session.user.last_sign_in_at).toLocaleString("de-DE")}</p>
      <p><strong>Browser:</strong> ${readBrowser()}</p>
      <div class="button-row">
        <button id="toggleMaintenance">Wartungsmodus umschalten</button>
        <button id="logout">Abmelden</button>
      </div>
    </article>

    <article class="panel panel-light full-width">
      <h2>Inhaltsverzeichnis (URLs)</h2>
      <ul class="url-list">${linkList}</ul>
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

  const next = !data?.maintenance;

  const { error } = await supabase
    .from("site_config")
    .update({ maintenance: next })
    .eq("id", 1);

  if (error) {
    alert("Wartungsmodus konnte nicht geändert werden.");
    return;
  }

  alert(`Maintenance ist jetzt: ${next}`);
}

async function waitForSession() {
  for (let i = 0; i < 6; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

function readBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unbekannt";
}

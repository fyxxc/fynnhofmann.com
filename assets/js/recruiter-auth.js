import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const RECRUITER_KEY = "recruiterPortalEnabled";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const currentPath = window.location.pathname;

if (!currentPath.startsWith("/maintenance")) {
  try {
    const { data } = await supabase
      .from("site_config")
      .select("maintenance")
      .eq("id", 1)
      .single();

    if (data?.maintenance === true) {
      window.location.replace("/maintenance/");
    }
  } catch (e) {
    console.warn("Maintenance Check fehlgeschlagen");
  }
}

if (localStorage.getItem(RECRUITER_KEY) === "false") {
  renderNotice("Recruiter-Bereich deaktiviert", "Der Zugang wurde im Admin-Bereich vorübergehend deaktiviert.");
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.replace("/recruiter/login.html");
    });
  }
  throw new Error("Recruiter disabled");
}

const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  const { data: refreshed } = await supabase.auth.getSession();

  if (!refreshed.session) {
    renderNotice("Authentifizierung erforderlich", "Bitte melde dich an, um auf Recruiting-Unterlagen zuzugreifen.");
    window.setTimeout(() => {
      window.location.replace("/recruiter/login.html");
    }, 700);
  }
}

const activeSession = session || (await supabase.auth.getSession()).data.session;

const welcome = document.getElementById("welcome");
if (welcome) {
  welcome.textContent = "Recruiter Bereich";
}

const dashboardText = document.getElementById("dashboard-text");
if (dashboardText) {
  dashboardText.textContent = "Alle relevanten Unterlagen und Nachweise sind hier zentral verfügbar.";
}

const accessNotice = document.getElementById("access-notice");
if (accessNotice) {
  accessNotice.hidden = true;
}

const dashboardContent = document.getElementById("dashboard-content");
if (dashboardContent) {
  dashboardContent.hidden = false;
}

const userEmail = document.getElementById("user-email");
if (userEmail && activeSession?.user?.email) {
  userEmail.textContent = activeSession.user.email;
}

const sessionStatus = document.getElementById("session-status");
if (sessionStatus) {
  sessionStatus.textContent = "Aktiv";
}

const lastLogin = document.getElementById("last-login");
if (lastLogin && activeSession?.user?.last_sign_in_at) {
  lastLogin.textContent = new Date(activeSession.user.last_sign_in_at).toLocaleString();
}

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

const environment = document.getElementById("environment");
if (environment) {
  environment.textContent = `${browser} / ${os}`;
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.replace("/recruiter/login.html");
  });
}

function renderNotice(title, text) {
  const notice = document.getElementById("access-notice");
  if (!notice) return;
  notice.hidden = false;
  notice.innerHTML = `<h2>${title}</h2><p>${text}</p>`;
}

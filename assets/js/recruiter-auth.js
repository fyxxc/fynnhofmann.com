import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* 🔐 SUPABASE CLIENT */
const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

/* ============================= */
/* 🛠 GLOBALER MAINTENANCE CHECK */
/* ============================= */

const currentPath = window.location.pathname;

/* Wartungsseite selbst darf NICHT blockiert werden */
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

/* ============================= */
/* 🔒 BLOCKIERENDER AUTH-CHECK   */
/* ============================= */

const { data: { session } } = await supabase.auth.getSession();

/* kleine Verzögerung damit Supabase Session laden kann */
if (!session) {

  const { data: refreshed } = await supabase.auth.getSession();

  if (!refreshed.session) {
    window.location.replace("/recruiter/login.html");
  }
}

/* ============================= */
/* 👋 UI DATEN SETZEN            */
/* ============================= */

const welcome = document.getElementById("welcome");
if (welcome) {
  welcome.textContent = "Willkommen im Recruiter Bereich.";
}

const userEmail = document.getElementById("user-email");
if (userEmail) {
  userEmail.textContent = session.user.email;
}

const sessionStatus = document.getElementById("session-status");
if (sessionStatus) {
  sessionStatus.textContent = "Aktiv";
}

const lastLogin = document.getElementById("last-login");
if (lastLogin) {
  lastLogin.textContent =
    new Date(session.user.last_sign_in_at).toLocaleString();
}

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

const environment = document.getElementById("environment");
if (environment) {
  environment.textContent = `${browser} / ${os}`;
}

/* 🚪 Logout */
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.replace("/recruiter/login.html");
  });
}

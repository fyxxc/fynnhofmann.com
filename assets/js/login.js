import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const form = document.getElementById("login-form");
const status = document.getElementById("status");

await checkMaintenance();

const { data: initialSession } = await supabase.auth.getSession();
if (initialSession.session) {
  window.location.replace("/app/");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  status.textContent = "Prüfe Anmeldung …";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    status.textContent = "Ungültige Anmeldung.";
    return;
  }

  const stableSession = await waitForSession();
  if (!stableSession) {
    status.textContent = "Login erfolgreich, Session wird noch geladen …";
  }

  status.textContent = "Weiterleitung …";
  window.location.replace("/app/");
});

async function checkMaintenance() {
  try {
    const res = await fetch("/config.json?cache=" + Date.now());
    const cfg = await res.json();
    if (cfg.maintenance === true) {
      window.location.replace("/maintenance/");
    }
  } catch (_) {
    // ignore
  }
}

async function waitForSession() {
  for (let i = 0; i < 6; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

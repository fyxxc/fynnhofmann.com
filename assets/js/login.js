import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

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
if (maintenanceActive) throw new Error("Maintenance active");

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const form = document.getElementById("login-form");
const status = document.getElementById("status");

const { data: existing } = await supabase.auth.getSession();
if (existing.session) {
  window.location.replace("/app/");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

const { data: initialSession } = await supabase.auth.getSession();
if (initialSession.session) {
  window.location.replace("/app/");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    status.textContent = "Ungültige Anmeldung.";
    return;
  }

  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      status.textContent = "Weiterleitung ...";
      window.location.replace("/app/");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  status.textContent = "Anmeldung erfolgreich, lade Dashboard ...";
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

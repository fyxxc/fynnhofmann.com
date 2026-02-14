import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const RECRUITER_KEY = "recruiterPortalEnabled";

async function checkMaintenance() {
  try {
    const res = await fetch("/config.json?cache=" + Date.now());
    const cfg = await res.json();

    if (cfg.maintenance === true) {
      window.location.href = "/maintenance/";
      return true;
    }
  } catch (e) {}
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

const recruiterEnabled = localStorage.getItem(RECRUITER_KEY);
if (recruiterEnabled === "false") {
  status.textContent = "Recruiter-Zugang ist aktuell deaktiviert. Bitte Admin kontaktieren.";
  form.querySelector("button")?.setAttribute("disabled", "disabled");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (localStorage.getItem(RECRUITER_KEY) === "false") {
    status.textContent = "Recruiter-Zugang ist aktuell deaktiviert.";
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  status.textContent = "Prüfe Anmeldung ...";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    status.textContent = "Ungültige Anmeldung.";
    return;
  }

  status.textContent = "Weiterleitung ...";
  window.location.href = "/recruiter/";
});

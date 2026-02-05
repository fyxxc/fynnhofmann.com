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

console.log("login.js geladen");

/* ============================= */
/* SUPABASE CLIENT               */
/* ============================= */

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const form = document.getElementById("login-form");
const status = document.getElementById("status");

/* ============================= */
/* LOGIN HANDLER                 */
/* ============================= */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  status.textContent = "Prüfe Anmeldung ...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  /* ===== ERROR HANDLING ===== */

  if (error) {
    console.log("Supabase Fehler:", error.message);

    /* Security: keine Details leaken */
    status.textContent = "Ungültige Anmeldung.";
    return;
  }

  /* ===== SUCCESS ===== */

  status.textContent = "Weiterleitung ...";
  window.location.href = "/app/";
});

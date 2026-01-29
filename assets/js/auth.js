import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

/* 🔐 PRÜFEN: ist jemand eingeloggt? */
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // NICHT eingeloggt → zurück zum Login
  window.location.href = "/login.html";
}

console.log(session.user.email);

/* 🚪 LOGOUT */
const logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

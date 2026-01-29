import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

// 🔐 Session prüfen
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.replace("/login.html");
  throw new Error("Not authenticated");
}

// 🧱 Dashboard jetzt ERST bauen
const app = document.getElementById("app");

app.innerHTML = `
  <main>
    <div class="container">
      <div class="site-name">fynnhofmann.com</div>

      <h1>Dashboard</h1>
      <p>Angemeldet als ${session.user.email}</p>

      <div class="dashboard-grid">
        <div class="card">
          <h3>Status</h3>
          <p>Aktiv</p>
        </div>

        <div class="card">
          <h3>Letzter Login</h3>
          <p>${new Date(session.user.last_sign_in_at).toLocaleString()}</p>
        </div>
      </div>

      <button id="logout">Abmelden</button>
    </div>
  </main>
`;

// 🚪 Logout
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.replace("/login.html");
});

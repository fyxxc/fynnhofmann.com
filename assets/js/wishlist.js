import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let rendered = false;

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const container = document.querySelector(".page-content");

if (!container) {
  console.error("page-content fehlt");
}

/* ===== Session sofort prüfen ===== */
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  renderWishlist(session);
}

/* ===== WICHTIG: Auth Listener (DEIN FIX) ===== */
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    renderWishlist(session);
  }
});

/* ===== Wishlist rendern ===== */
function renderWishlist(session) {

  if (rendered) return;
  rendered = true;

  container.innerHTML = `
    <div class="site-name">fynnhofmann.com</div>

    <h1>Wishlist</h1>

    <div class="card">
      <input id="title" placeholder="Titel">
      <input id="link" placeholder="Link">
      <textarea id="description" placeholder="Beschreibung"></textarea>
      <button id="addWish">Hinzufügen</button>
    </div>

    <div id="wishList"></div>
  `;

  document.getElementById("addWish").addEventListener("click", addWish);

  loadWishes();
}

/* ===== Wish speichern ===== */
async function addWish(){

  const title = document.getElementById("title").value;
  const link = document.getElementById("link").value;
  const description = document.getElementById("description").value;

  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("wishes").insert({
    title,
    link,
    description,
    user_id: user.id
  });

  loadWishes();
}

/* ===== Wishes laden ===== */
async function loadWishes(){

  const list = document.getElementById("wishList");
  if (!list) return;

  list.innerHTML = "";

  const { data } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at",{ascending:false});

  data.forEach(wish => {

    const created = new Date(wish.created_at);
    const now = new Date();
    const diffDays = Math.floor((now-created)/(1000*60*60*24));
    const canBuy = diffDays >= 7;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${wish.title}</h3>
      <p>${wish.description ?? ""}</p>
      <a href="${wish.link}" target="_blank">Link öffnen</a>
      <p>${canBuy ? "✅ Kauf erlaubt" : "⏳ Noch "+(7-diffDays)+" Tage warten"}</p>
    `;

    list.appendChild(div);
  });
}

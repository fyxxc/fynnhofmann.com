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

/* ===== VIELE ALLGEMEINE KATEGORIEN ===== */
const categories = [
  "Fashion",
  "Schuhe",
  "Accessoires",
  "Beauty",
  "Pflege",
  "Parfum",
  "Interior",
  "Möbel",
  "Dekoration",
  "Küche",
  "Haushalt",
  "Elektronik",
  "Smartphone",
  "Laptop",
  "Gaming",
  "Audio",
  "Smart Home",
  "Fitness",
  "Gesundheit",
  "Bücher",
  "Weiterbildung",
  "Reisen",
  "Hotel",
  "Erlebnisse",
  "Food",
  "Restaurant",
  "Abos",
  "Lifestyle",
  "Luxus",
  "Geschenke",
  "Auto",
  "Motorrad",
  "Outdoor",
  "Camping",
  "Random Dopamin"
];

/* ===== Session prüfen ===== */
const session = await getStableSession();

if (!session) {
  window.location.replace("/login.html");
} else {
  renderWishlist(session);
}

supabase.auth.onAuthStateChange((_event, changedSession) => {
  if (!changedSession) {
    window.location.replace("/login.html");
    return;
  }
  renderWishlist(changedSession);
});

async function getStableSession() {
  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

/* ===== Wishlist UI ===== */
function renderWishlist(session){

  if (rendered) return;
  rendered = true;

  container.innerHTML = `
    <div class="site-name">fynnhofmann.com</div>

    <h1>
      <span class="material-symbols-outlined">shopping_cart</span>
      Wishlist
    </h1>

    <div class="card">

      <span class="material-symbols-outlined">add_shopping_cart</span>

      <input id="title" placeholder="Titel">
      <input id="link" placeholder="Link">
      <textarea id="description" placeholder="Beschreibung"></textarea>

      <select id="category">
        ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
      </select>

      <button id="addWish">
        <span class="material-symbols-outlined">add</span>
        Wunsch hinzufügen
      </button>

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
  const category = document.getElementById("category").value;

  if(!title) return alert("Titel fehlt");

  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("wishes").insert({
    title,
    link,
    description,
    category,
    user_id: user.id
  });

  loadWishes();
}

/* ===== Wishes laden ===== */
async function loadWishes(){

  const list = document.getElementById("wishList");
  if(!list) return;

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
      <h3>
        <span class="material-symbols-outlined">inventory_2</span>
        ${wish.title}
      </h3>

      <p>${wish.description ?? ""}</p>

      <p>
        <span class="material-symbols-outlined">folder</span>
        ${wish.category ?? "Keine Kategorie"}
      </p>

      <a href="${wish.link}" target="_blank">
        <span class="material-symbols-outlined">link</span>
        Link öffnen
      </a>

      <p>
        ${
          canBuy
          ? '<span class="material-symbols-outlined">check_circle</span> Kauf erlaubt'
          : '<span class="material-symbols-outlined">schedule</span> Noch '+(7-diffDays)+' Tage warten'
        }
      </p>
    `;

    list.appendChild(div);
  });
}

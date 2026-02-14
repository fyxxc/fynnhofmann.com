import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://zjpmumucjrltpcykmdti.supabase.co",
  "sb_publishable_2RFiY1Lw7Lucgt9fXhYRJQ_k37Ggs4N"
);

const wishlistText = document.getElementById("wishlist-text");
const wishlistContent = document.getElementById("wishlist-content");

const categories = [
  "Fashion", "Schuhe", "Accessoires", "Beauty", "Pflege", "Parfum", "Interior", "Möbel",
  "Dekoration", "Küche", "Haushalt", "Elektronik", "Smartphone", "Laptop", "Gaming", "Audio",
  "Smart Home", "Fitness", "Gesundheit", "Bücher", "Weiterbildung", "Reisen", "Hotel", "Erlebnisse",
  "Food", "Restaurant", "Abos", "Lifestyle", "Luxus", "Geschenke", "Auto", "Motorrad", "Outdoor",
  "Camping", "Random Dopamin"
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

  document.getElementById("addWish")?.addEventListener("click", addWish);
  loadWishes();
}

async function addWish() {
  const title = document.getElementById("title")?.value;
  const link = document.getElementById("link")?.value;
  const description = document.getElementById("description")?.value;
  const category = document.getElementById("category")?.value;

  if (!title) {
    alert("Titel fehlt");
    return;
  }

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

async function loadWishes() {
  const list = document.getElementById("wishList");
  if (!list) return;

  const { data } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false });

  list.innerHTML = "";

  data?.forEach((wish) => {
    const created = new Date(wish.created_at);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    const canBuy = diffDays >= 7;

    const item = document.createElement("div");
    item.className = "wish-item";
    item.innerHTML = `
      <h3>${wish.title}</h3>
      <p>${wish.description ?? ""}</p>
      <p><strong>Kategorie:</strong> ${wish.category ?? "Keine Kategorie"}</p>
      <p><a href="${wish.link}" target="_blank" rel="noreferrer">Link öffnen</a></p>
      <p>${canBuy ? "Kauf erlaubt" : `Noch ${7 - diffDays} Tage warten`}</p>
    `;
    list.appendChild(item);
  });
}

async function waitForSession() {
  for (let i = 0; i < 6; i += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

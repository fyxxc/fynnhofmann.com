import { requireAuth, supabase } from "./auth.js";

const app = document.getElementById("app-content");
const list = document.getElementById("wishList");

await requireAuth(); // gleiches Login-Gate wie Dashboard
app.style.display = "block";

const addBtn = document.getElementById("addWish");

addBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const link = document.getElementById("link").value;
  const description = document.getElementById("description").value;

  if(!title) return alert("Titel fehlt bro 😄");

  const { data: userData } = await supabase.auth.getUser();

  await supabase.from("wishes").insert({
    title,
    link,
    description,
    user_id: userData.user.id
  });

  loadWishes();
});

async function loadWishes(){

  list.innerHTML = "";

  const { data } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending:false });

  data.forEach(wish => {

    const created = new Date(wish.created_at);
    const now = new Date();

    const diffDays = Math.floor((now - created) / (1000*60*60*24));
    const canBuy = diffDays >= 7;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${wish.title}</h3>
      <p>${wish.description ?? ""}</p>

      <a href="${wish.link}" target="_blank">
        <span class="material-symbols-outlined">link</span>
        Link öffnen
      </a>

      <div>
        ${
          canBuy
          ? `<span class="material-symbols-outlined">check_circle</span> Kauf erlaubt`
          : `<span class="material-symbols-outlined">schedule</span> Noch ${7-diffDays} Tage warten`
        }
      </div>
    `;

    list.appendChild(div);
  });
}

loadWishes();

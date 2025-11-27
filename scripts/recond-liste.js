import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { openRecondPopup } from "./recond-popup.js";

const list = document.getElementById("list");
const search = document.getElementById("search");

let ALL = [];

// Charger toutes les fiches
async function load() {
    const snap = await getDocs(collection(db, "pcRecond"));
    ALL = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render(ALL);
}

// Afficher la liste
function render(arr) {
    list.innerHTML = "";

    if (arr.length === 0) {
        list.innerHTML = `<p style='color:#777;'>Aucune demande trouvée.</p>`;
        return;
    }

    arr.forEach(f => {
        const div = document.createElement("div");
        div.className = "pc-card";

        div.innerHTML = `
            <strong>${f.nom || "—"}</strong> — ${f.tel || ""}<br>
            <small>📅 ${new Date(f.date).toLocaleDateString("fr-FR")}</small><br><br>

            Type : <b>${f.typePC}</b> ${f.tailleEcran ? " — " + f.tailleEcran : ""}<br>
            RAM : <b>${f.ram}</b> — Stockage : <b>${f.stockage}</b><br>
            Usage : <b>${f.usage}</b><br>
            Budget : <b>${f.budget} €</b><br><br>

            ${f.infos ? `<div><b>Infos :</b> ${f.infos}</div><br>` : ""}

            <button class="btn-edit" onclick="editRecond('${f.id}')">✏ Modifier</button>
            <button class="btn-delete" onclick="deleteRecond('${f.id}')">🗑 Supprimer</button>
            <button class="btn-found" onclick="markFound(this)">💚</button>
        `;

        list.appendChild(div);
    });
}

window.editRecond = function(id) {
    openRecondPopup(id);
};

window.deleteRecond = async function(id) {
    if (!confirm("Supprimer cette demande ?")) return;

    await deleteDoc(doc(db, "pcRecond", id));
    alert("Demande supprimée !");
    load();
};

// Recherche temps réel
search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    const filtered = ALL.filter(f =>
        (f.nom || "").toLowerCase().includes(q) ||
        (f.tel || "").includes(q)
    );
    render(filtered);
});

load();
window.markFound = function(button) {
    const card = button.closest(".pc-card");

    // Toggle la classe
    card.classList.toggle("pc-found");
};


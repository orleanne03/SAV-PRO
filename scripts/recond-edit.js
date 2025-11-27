import { db } from "./firebase-config.js";
import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const editBox = document.getElementById("edit-box");

// Récup ID dans l’URL
const params = new URLSearchParams(location.search);
const id = params.get("id");

// Charger fiche
async function load() {
    const snap = await getDoc(doc(db, "pcRecond", id));

    if (!snap.exists()) {
        editBox.innerHTML = "<p style='color:red'>Fiche introuvable.</p>";
        return;
    }

    const f = snap.data();

    editBox.innerHTML = `
        <label>Nom</label>
        <input id="edit-nom" class="input" value="${f.nom}">

        <label>Téléphone</label>
        <input id="edit-tel" class="input" value="${f.tel}">

        <label>Type PC</label>
        <input id="edit-typePC" class="input" value="${f.typePC}">

        <label>Taille écran</label>
        <input id="edit-taille" class="input" value="${f.tailleEcran || ""}">

        <label>RAM</label>
        <input id="edit-ram" class="input" value="${f.ram}">

        <label>Stockage</label>
        <input id="edit-stockage" class="input" value="${f.stockage}">

        <label>Usage</label>
        <input id="edit-usage" class="input" value="${f.usage}">

        <label>Budget (€)</label>
        <input id="edit-budget" class="input" value="${f.budget}">

        <label>Infos supplémentaires</label>
        <textarea id="edit-infos" class="input">${f.infos || ""}</textarea>

        <button class="btn-save" id="save-btn">💾 Enregistrer</button>
    `;

    document.getElementById("save-btn").addEventListener("click", save);
}

async function save() {
    try {
        await updateDoc(doc(db, "pcRecond", id), {
            nom: document.getElementById("edit-nom").value.trim(),
            tel: document.getElementById("edit-tel").value.trim(),
            typePC: document.getElementById("edit-typePC").value,
            tailleEcran: document.getElementById("edit-taille").value,
            ram: document.getElementById("edit-ram").value,
            stockage: document.getElementById("edit-stockage").value,
            usage: document.getElementById("edit-usage").value,
            budget: document.getElementById("edit-budget").value,
            infos: document.getElementById("edit-infos").value.trim()
        });

        alert("Modifications enregistrées !");
        location.href = "recond-liste.html";

    } catch (e) {
        console.error(e);
        alert("Erreur lors de la mise à jour.");
    }
}

load();

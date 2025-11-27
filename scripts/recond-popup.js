import { db } from "./firebase-config.js";
import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const popup = document.getElementById("popupRecond");
const popupContent = document.getElementById("popupRecondContent");

// Ouvrir la popup
export async function openRecondPopup(id) {
    popup.style.display = "flex";
    popupContent.innerHTML = "Chargement...";

    const snap = await getDoc(doc(db, "pcRecond", id));

    if (!snap.exists()) {
        popupContent.innerHTML = "<p style='color:red'>Fiche introuvable.</p>";
        return;
    }

    const f = snap.data();

    popupContent.innerHTML = `
        <h2>Modifier : ${f.nom}</h2>

        <label>Nom</label>
        <input id="edit-nom" class="input" value="${f.nom}">

        <label>Téléphone</label>
        <input id="edit-tel" class="input" value="${f.tel}">

        <label>Type PC</label>
        <input id="edit-type" class="input" value="${f.typePC}">

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

        <br><br>
        <button id="btn-save" class="btn-save">💾 Enregistrer</button>
        <button id="btn-close" class="btn-cancel">Fermer</button>
    `;

    document.getElementById("btn-save").onclick = () => saveRecond(id);
    document.getElementById("btn-close").onclick = closePopup;
}

// Enregistrer dans Firestore
async function saveRecond(id) {
    try {
        await updateDoc(doc(db, "pcRecond", id), {
            nom: document.getElementById("edit-nom").value.trim(),
            tel: document.getElementById("edit-tel").value.trim(),
            typePC: document.getElementById("edit-type").value,
            tailleEcran: document.getElementById("edit-taille").value,
            ram: document.getElementById("edit-ram").value,
            stockage: document.getElementById("edit-stockage").value,
            usage: document.getElementById("edit-usage").value,
            budget: document.getElementById("edit-budget").value,
            infos: document.getElementById("edit-infos").value.trim()
        });

        alert("Modifications enregistrées !");
        closePopup();
        location.reload();

    } catch (e) {
        console.error(e);
        alert("Erreur lors de la mise à jour.");
    }
}

// Fermer la popup
function closePopup() {
    popup.style.display = "none";
}

/* ============================================================
   PC RECONDITIONNÉ — AUTO-COMPLÉTION + ENREGISTREMENT
   Compatible avec ton système existant (fiche SAV)
============================================================ */

import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------- Variables ---------- */
let CLIENTS = [];
let clientsReady = false;

/* ============================================================
   1) CHARGER CLIENTS (cache + Firestore)
============================================================ */
const cache = localStorage.getItem("clientsCache");
if (cache) {
    CLIENTS = JSON.parse(cache);
    clientsReady = true;
}

setTimeout(async () => {
    try {
        const snap = await getDocs(collection(db, "clients"));
        CLIENTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        localStorage.setItem("clientsCache", JSON.stringify(CLIENTS));
        clientsReady = true;
    } catch (err) {
        console.warn("Firestore KO :", err);
    }
}, 30);


/* ============================================================
   2) HIDE + SHOW SUGGESTIONS
============================================================ */
function hideSuggestions() {
    suggestionsNom.style.display = "none";
    suggestionsTel.style.display = "none";
}

function showSuggestions(list, zone) {
    const box = zone === "nom" ? suggestionsNom : suggestionsTel;

    if (!list.length) return box.style.display = "none";

    box.innerHTML = list.map(c => `
        <div class="sug-item" onclick="selectClient('${c.nom}', '${formatTel(c.tel)}')">
            <strong>${c.nom}</strong><br>
            <small>${formatTel(c.tel)}</small>
        </div>
    `).join("");

    box.style.display = "block";
}

window.selectClient = function(n, t) {
    nom.value = n;
    tel.value = t;
    hideSuggestions();
};


/* ============================================================
   3) FORMATAGE TÉLÉPHONE
============================================================ */
function formatTel(str) {
    const raw = (str || "").replace(/\D/g, "").substring(0, 10);
    return raw.replace(/(..?)(..?)(..?)(..?)(..)/, "$1-$2-$3-$4-$5");
}

tel.addEventListener("input", () => {
    let raw = tel.value.replace(/\D/g, "").substring(0, 10);
    tel.value = formatTel(raw);

    if (!clientsReady || raw.length < 4) return hideSuggestions();

    const results = CLIENTS.filter(c =>
        (c.tel || "").replace(/\D/g, "").startsWith(raw)
    );

    showSuggestions(results, "tel");
});


/* ============================================================
   4) RECHERCHE NOM
============================================================ */
nom.addEventListener("input", () => {
    if (!clientsReady) return;

    nom.value = nom.value.toUpperCase();
    const val = nom.value.trim();

    if (val.length < 1) return hideSuggestions();

    const results = CLIENTS.filter(c =>
        (c.nom || "").toUpperCase().startsWith(val)
    );

    showSuggestions(results, "nom");
});


/* ============================================================
   5) GESTION TYPE PC + TAILLE ÉCRAN
============================================================ */
typePC.addEventListener("change", () => {
    tailleEcranZone.style.display = "none";

    if (typePC.value === "portable") {
        tailleEcran.innerHTML = `
            <option>14"</option>
            <option>15"</option>
            <option>17"</option>
        `;
        tailleEcranZone.style.display = "block";
    }

    if (typePC.value === "aio") {
        tailleEcran.innerHTML = `
            <option>19"</option>
            <option>22"</option>
            <option>24"</option>
            <option>27"</option>
        `;
        tailleEcranZone.style.display = "block";
    }
});


/* ============================================================
   6) SAUVEGARDE FIRESTORE
============================================================ */
window.envoyerRecondi = async function() {

    const data = {
        nom: nom.value.trim(),
        tel: tel.value.trim(),
        typePC: typePC.value,
        tailleEcran: tailleEcran.value || null,
        ram: ram.value,
        stockage: stockage.value,
        usage: usage.value,
        budget: budget.value,
        infos: infos.value.trim(),
        date: Date.now()
    };

    if (!data.nom || !data.tel) {
        alert("Nom + Téléphone obligatoire !");
        return;
    }

    try {
        data.date = new Date().toISOString();
        await addDoc(collection(db, "pcRecond"), data);
        alert("Demande enregistrée !");
    } catch (e) {
        console.error(e);
        alert("Erreur lors de l'enregistrement.");
    }
};

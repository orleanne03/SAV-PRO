// =============================================================
//  SAV SOS ORDI 03 — CREATE FICHE (VERSION SANS PHOTO)
//  Compatible Firebase Firestore
//  Design intact, logique stabilisée et pro
// =============================================================

import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------------------------------------------------------------------
// VARIABLES
// ---------------------------------------------------------------------
let clientsCache = [];
let appareils = [];

// ---------------------------------------------------------------------
// INITIALISATION
// ---------------------------------------------------------------------
export async function initCreatePage() {
    await chargerClients();
    console.log("✔ Clients chargés :", clientsCache);
}

// ---------------------------------------------------------------------
// CHARGER LISTE CLIENTS
// ---------------------------------------------------------------------
async function chargerClients() {
    const snap = await getDocs(collection(db, "clients"));
    snap.forEach(d => clientsCache.push(d.data()));
}

// ---------------------------------------------------------------------
// FORMATAGE TÉLÉPHONE
// ---------------------------------------------------------------------
window.formatTel = function () {
    let t = tel.value.replace(/\D/g, "").slice(0, 10);
    tel.value = t.replace(/(..)(?=.)/g, "$1-");
};

// ---------------------------------------------------------------------
// RECHERCHE CLIENT PAR NOM
// ---------------------------------------------------------------------
window.rechercherClientNom = function () {
    const v = nom.value.trim().toUpperCase();
    if (v.length < 2) {
        suggest.style.display = "none";
        return;
    }
    const r = clientsCache.filter(c => c.nom.toUpperCase().includes(v));
    afficherSuggestions(r);
};

// ---------------------------------------------------------------------
// RECHERCHE CLIENT PAR TÉLÉPHONE
// ---------------------------------------------------------------------
window.rechercherClientTel = function () {
    const v = tel.value.replace(/\D/g, "");
    if (v.length < 3) {
        suggest.style.display = "none";
        return;
    }
    const r = clientsCache.filter(c =>
        (c.tel || "").replace(/\D/g, "").startsWith(v)
    );
    afficherSuggestions(r);
};

// ---------------------------------------------------------------------
// AFFICHAGE SUGGESTIONS CLIENT
// ---------------------------------------------------------------------
function afficherSuggestions(list) {
    suggest.innerHTML = "";

    if (list.length === 0) {
        suggest.innerHTML = `<div class="sug" style="color:#b00;">Aucun résultat</div>`;
        suggest.style.display = "block";
        return;
    }

    list.forEach(c => {
        suggest.innerHTML += `
            <div class="sug" onclick="remplirClient('${c.nom}', '${c.tel}')">
                ${c.nom} — ${c.tel}
            </div>`;
    });

    suggest.style.display = "block";
}

window.remplirClient = function (n, t) {
    nom.value = n;
    tel.value = t;
    suggest.style.display = "none";
};

// Clic extérieur = fermeture suggestions
document.addEventListener("click", e => {
    if (!e.target.closest("#suggest") &&
        !e.target.closest("#nom") &&
        !e.target.closest("#tel")) {
        suggest.style.display = "none";
    }
});

// ---------------------------------------------------------------------
// AJOUT D’UN APPAREIL
// ---------------------------------------------------------------------
window.ajouterAppareil = function () {

    const t = type.value.trim();
    const m = marque.value.trim();
    const mod = modele.value.trim();

    if (!t || !m || !mod)
        return alert("Merci de remplir Type + Marque + Modèle");

    appareils.push({
        type: t,
        marque: m,
        modele: mod
    });

    afficherAppareils();

    marque.value = "";
    modele.value = "";
};

function afficherAppareils() {
    listeAppareils.innerHTML = appareils.map((a, i) => `
        <div>
            ${a.type} — ${a.marque} ${a.modele}
            <button class="btn-danger small-btn" onclick="supprimerAppareil(${i})">🗑</button>
        </div>
    `).join("");
}

window.supprimerAppareil = function (i) {
    appareils.splice(i, 1);
    afficherAppareils();
};

// ---------------------------------------------------------------------
// CRÉER UNE FICHE (VERSION SANS PHOTOS / SANS SIGNATURES)
// ---------------------------------------------------------------------
window.creerFiche = async function () {

    // VALIDATIONS
    if (!nom.value.trim()) return alert("Nom manquant");
    if (!tel.value.trim()) return alert("Téléphone manquant");
    if (appareils.length === 0) return alert("Ajoutez au moins un appareil");

    // TRAVAUX
    const travaux = [...document.querySelectorAll(".trav:checked")]
        .map(t => t.value);

    // CRÉATION DE LA FICHE (SANS PHOTO)
    const fiche = {
        nom: nom.value.trim().toUpperCase(),
        tel: tel.value.trim(),
        appareils: appareils,
        probleme: prob.value.trim(),
        travaux: travaux,
        motdepasse: mdp.value.trim(),

        // STATUTS
        repare: false,
        hsok: false,

        // TARIFS
        tarifEstimation: "",
        tarifReel: "",

        // RETRAIT
        dateRecup: "",
        heureRecup: "",

        // DATE DE CRÉATION
        date: new Date().toISOString()
    };

    // INSERTION FIRESTORE
    await addDoc(collection(db, "fiches"), fiche);

    alert("✔ Fiche créée !");
    location.href = "historique.html";
};

/* ============================================================
   HISTORIQUE CLIENT — STATS JS
   Version A — bouton désarchiver simple
============================================================ */

/* ------------- Firebase Init ------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR8PVlerANOGdzNBwZjj81I6Ajtbn63eI",
    authDomain: "sosordi03-sav.firebaseapp.com",
    projectId: "sosordi03-sav"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* DOM */
const searchClient = document.getElementById("searchClient");
const suggestionsBox = document.getElementById("suggestions");
const clientInfo = document.getElementById("clientInfo");
const clientStats = document.getElementById("clientStats");

/* Variables */
let allFiches = [];
let allClients = [];

/* ============================================================
   Chargement des fiches
============================================================ */

async function loadFiches() {
    const snap = await getDocs(query(collection(db, "fiches"), orderBy("date", "desc")));
    allFiches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    buildClientList();
}

loadFiches();

/* ============================================================
   Liste clients
============================================================ */

function buildClientList() {
    const map = new Map();

    allFiches.forEach(f => {
        if (!f.nom || !f.tel) return;

        const key = f.nom.toLowerCase() + "|" + f.tel.replace(/\D/g, "");
        if (!map.has(key)) {
            map.set(key, { nom: f.nom, tel: f.tel });
        }
    });

    allClients = [...map.values()];
}

/* ============================================================
   Auto-complétion
============================================================ */

searchClient.addEventListener("input", () => {
    const txt = searchClient.value.toLowerCase().trim();
    if (!txt) return suggestionsBox.style.display = "none";

    const results = allClients.filter(c =>
        c.nom.toLowerCase().includes(txt) ||
        c.tel.replace(/\D/g, "").includes(txt)
    );

    if (!results.length) return suggestionsBox.style.display = "none";

    suggestionsBox.innerHTML = results.map(c => `
        <div class="sug-item" data-nom="${c.nom}" data-tel="${c.tel}">
            <strong>${c.nom}</strong><br><small>${c.tel}</small>
        </div>
    `).join("");

    suggestionsBox.style.display = "block";

    document.querySelectorAll(".sug-item").forEach(item => {
        item.onclick = () => {
            searchClient.value = `${item.dataset.nom} (${item.dataset.tel})`;
            loadClientData(item.dataset.nom, item.dataset.tel);
            suggestionsBox.style.display = "none";
        };
    });
});

/* ============================================================
   Charger données client
============================================================ */

function loadClientData(nom, tel) {
    const clean = tel.replace(/\D/g, "");

    const fiches = allFiches.filter(f =>
        f.nom?.toLowerCase() === nom.toLowerCase() &&
        f.tel.replace(/\D/g, "") === clean
    );

    if (!fiches.length) return;

    fiches.sort((a, b) => (b.date || 0) - (a.date || 0));

    renderClientInfo(nom, tel);
    renderClientStats(fiches);
}

/* ============================================================
   Affichage — Informations client
============================================================ */

function renderClientInfo(nom, tel) {
    clientInfo.style.display = "block";
    clientInfo.innerHTML = `
        <h2>👤 Informations client</h2>
        <div class="stat-line"><strong>Nom :</strong> ${nom}</div>
        <div class="stat-line"><strong>Téléphone :</strong> ${tel}</div>
    `;
}

/* ============================================================
   Affichage — Historique technique + Appareils
============================================================ */

function renderClientStats(fiches) {
    clientStats.style.display = "block";

    // Appareils connus
    const appareilsSet = new Set();
    fiches.forEach(f => {
        if (f.type || f.marque || f.modele)
            appareilsSet.add(`${f.type || ""} ${f.marque || ""} ${f.modele || ""}`.trim());

        if (f.appareils && f.appareils[0]) {
            const a = f.appareils[0];
            appareilsSet.add(`${a.type} ${a.marque} ${a.modele}`.trim());
        }
    });

    const appareilsList = [...appareilsSet];

    // Historique
    const historiqueTech = fiches.map(f => ({
        date: f.date ? new Date(f.date).toLocaleDateString("fr-FR") : "—",
        appareil: f.type || f.appareils?.[0]?.type || "Matériel inconnu",
        probleme: f.probleme || "—"
    }));

    clientStats.innerHTML = `
        <h2>🛠 Historique technique & Appareils</h2>

        <div class="section-title">🖥 Appareils connus :</div>
        ${appareilsList.map(a => `<div class="stat-line">• ${a}</div>`).join("")}

        <div class="section-title" style="margin-top:15px;">🔧 Historique technique :</div>
        ${historiqueTech.map(h => `
            <div class="stat-line">
                <strong>${h.date}</strong> — ${h.appareil}<br>
                <small>${h.probleme}</small>
            </div>
        `).join("<br>")}
    `;

    // 🔥 VERSION A : bouton simple à la fin
    const archived = fiches.filter(f => f.archive === true);
    if (archived.length) {
        const id = archived[0].id;
        clientStats.innerHTML += `
            <button class="btn-desarchiver" onclick="desarchiverFiche('${id}')">
                ♻ Désarchiver
            </button>
        `;
    }
}

/* ============================================================
   Désarchiver une fiche
============================================================ */

window.desarchiverFiche = async function(id) {
    if (!confirm("Désarchiver cette intervention ?")) return;

    try {
        await updateDoc(doc(db, "fiches", id), { archive: false });
        alert("Intervention désarchivée !");
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la désarchivation.");
    }
};

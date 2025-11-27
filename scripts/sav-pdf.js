// =============================================================
//  SAV SOS ORDI 03 — MODULE PDF PRO (VERSION SANS PHOTOS)
// =============================================================
//
//  Objectif : Générer un PDF propre, compatible imprimante,
//  SANS photos, SANS signatures, avec un HTML clair.
//
// =============================================================

import { db } from "./firebase-config.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------------------------------------------------------------
// GÉNÉRATION PDF
// ---------------------------------------------------------------
window.genererPDF = async function (id) {

    if (!id) return alert("Erreur : ID fiche manquant.");

    // Charger la fiche depuis Firestore
    const ref = doc(db, "fiches", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("❌ Fiche introuvable.");
        return;
    }

    const f = snap.data();

    // -----------------------------------------------------------
    // Construire le HTML du PDF (SANS PHOTOS)
    // -----------------------------------------------------------
    const appareilsHtml = (f.appareils || [])
        .map(a => `
            <tr>
                <td>${a.type}</td>
                <td>${a.marque}</td>
                <td>${a.modele}</td>
            </tr>
        `)
        .join("");

    const travauxHtml = (f.travaux || [])
        .map(t => `<li>${t}</li>`)
        .join("");

    const dateLocale = new Date(f.date).toLocaleString("fr-FR");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche SAV ${id}</title>

<style>
body {
    font-family: Arial, sans-serif;
    padding: 20px;
    font-size: 14px;
}
h1 {
    text-align: center;
    margin-bottom: 10px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}
td, th {
    border: 1px solid #333;
    padding: 6px;
}
.section {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 16px;
}
ul { margin-top:5px; }
</style>

</head>
<body>

<h1>FICHE SAV</h1>

<div class="section">Informations client</div>
<table>
<tr><th>Nom</th><td>${f.nom}</td></tr>
<tr><th>Téléphone</th><td>${f.tel}</td></tr>
<tr><th>Date d'entrée</th><td>${dateLocale}</td></tr>
</table>

<div class="section">Appareils</div>
<table>
<tr>
    <th>Type</th>
    <th>Marque</th>
    <th>Modèle</th>
</tr>
${appareilsHtml}
</table>

<div class="section">Problème déclaré</div>
<p>${f.probleme || "-"}</p>

<div class="section">Travaux demandés</div>
<ul>
${travauxHtml || "<li>Aucun</li>"}
</ul>

<div class="section">Mot de passe</div>
<p>${f.motdepasse || "-"}</p>

<div class="section">Statut</div>
<p>
    ${f.repare ? "✔ Appareil réparé" : ""}
    ${f.hsok ? "✔ HS validé avec client" : ""}
    ${(!f.repare && !f.hsok) ? "⏳ En cours" : ""}
</p>

<div class="section">Retrait</div>
<table>
<tr><th>Date retrait</th><td>${f.dateRecup || "-"}</td></tr>
<tr><th>Heure retrait</th><td>${f.heureRecup || "-"}</td></tr>
</table>

<script>
    window.print();
</script>

</body>
</html>
`;

    // -----------------------------------------------------------
    // Ouvrir une fenêtre pour impression PDF
    // -----------------------------------------------------------
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
};

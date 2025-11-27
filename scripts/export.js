import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR8PVlerANOGdzNBwZjj81I6Ajtbn63eI",
    authDomain: "sosordi03-sav.firebaseapp.com",
    projectId: "sosordi03-sav"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------------------------
// CHARGEMENT DES FICHES
// --------------------------
async function loadFiches() {
    const snap = await getDocs(collection(db, "fiches"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function applyFilters(data) {
    const client = document.getElementById("filterClient").value.trim().toUpperCase();
    const statut = document.getElementById("filterStatut").value;
    const d1 = document.getElementById("dateStart").value;
    const d2 = document.getElementById("dateEnd").value;

    return data.filter(f => {
        if (client && !f.nom.toUpperCase().includes(client)) return false;
        if (statut && f.statut !== statut) return false;

        if (d1) {
            const fd = new Date(f.date);
            const sd = new Date(d1);
            if (fd < sd) return false;
        }

        if (d2) {
            const fd = new Date(f.date);
            const ed = new Date(d2);
            if (fd > ed) return false;
        }

        return true;
    });
}

// --------------------------
// EXPORT EXCEL
// --------------------------
window.exportExcel = async function() {
    const fiches = applyFilters(await loadFiches());

    const rows = fiches.map(f => ({
        ID: f.id,
        Nom: f.nom,
        Téléphone: f.tel,
        Date: new Date(f.date).toLocaleDateString(),
        Statut: f.statut,
        Estimation: f.tarifEstimation || "",
        Réel: f.tarifReel || "",
        Problème: f.probleme || ""
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fiches SAV");

    XLSX.writeFile(wb, "export_sav.xlsx");
};

// --------------------------
// EXPORT CSV
// --------------------------
window.exportCSV = async function () {
    const fiches = applyFilters(await loadFiches());

    const header = "ID;Nom;Téléphone;Date;Statut;Estimation;Réel;Problème\n";

    const rows = fiches.map(f =>
        `${f.id};${f.nom};${f.tel};${new Date(f.date).toLocaleDateString()};${f.statut};${f.tarifEstimation || ""};${f.tarifReel || ""};"${f.probleme || ""}"`
    ).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export_sav.csv";
    a.click();
};

// --------------------------
// EXPORT PDF SIMPLE
// --------------------------
window.exportPDF = async function () {
    const fiches = applyFilters(await loadFiches());

    let text = `
SAV SOS ORDI 03 — EXPORT PDF
-------------------------------------------

Nombre de fiches : ${fiches.length}

`;

    fiches.forEach(f => {
        text += `
-------------------------------------------
Client : ${f.nom}
Date : ${new Date(f.date).toLocaleDateString()}
Statut : ${f.statut}
Estimation : ${f.tarifEstimation || ""}
Réel : ${f.tarifReel || ""}
Problème : ${f.probleme || ""}
`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export_sav.pdf";
    a.click();
};

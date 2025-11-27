import { db } from "./firebase-config.js";
import { getFirestore, doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===========================================
// Récupère l'ID depuis l'URL
// ===========================================
const params = new URLSearchParams(window.location.search);
const ficheId = params.get("id");

const zone = document.getElementById("factureZone");

// ===========================================
// Chargement fiche
// ===========================================
async function chargerFiche() {
    if (!ficheId) {
        zone.innerHTML = "<p>❌ Fiche introuvable</p>";
        return;
    }

    const snap = await getDoc(doc(db, "fiches", ficheId));
    if (!snap.exists()) {
        zone.innerHTML = "<p>❌ Fiche inexistante</p>";
        return;
    }

    const f = snap.data();

    const appareilTxt = (f.appareils || [])
        .map(a => `${a.type} — ${a.marque} ${a.modele}`)
        .join("<br>");

    const travauxTxt = (f.travaux || []).join("<br>");

    const dateRecup = f.dateRecup
        ? new Date(f.dateRecup).toLocaleDateString()
        : "—";

    const heureRecup = f.heureRecup || "—";

    const total = f.tarifReel || f.tarifEstimation || "—";

    // ================================
    // *** CONSTRUCTION HTML PRO ***
    // ================================
    zone.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <div style="
                font-size:28px;
                font-weight:800;
                color:#16a34a;
            ">SAV SOS ORDI 03</div>
            <div style="color:#444; margin-top:6px;">
                Assistance & Dépannage Informatique
            </div>
        </div>

        <div style="margin-bottom:18px;">
            <strong>Numéro de facture :</strong> ${ficheId}<br>
            <strong>Date :</strong> ${new Date().toLocaleDateString()}
        </div>

        <h3>👤 Client</h3>
        <div class="fact-line">
            <span>Nom</span>
            <span>${f.nom}</span>
        </div>
        <div class="fact-line">
            <span>Téléphone</span>
            <span>${f.tel}</span>
        </div>

        <h3 style="margin-top:25px;">💻 Matériel concerné</h3>
        <div>${appareilTxt}</div>

        <h3 style="margin-top:25px;">⚠️ Problème</h3>
        <div>${f.probleme || "—"}</div>

        <h3 style="margin-top:25px;">🛠 Travaux effectués</h3>
        <div>${travauxTxt || "—"}</div>

        <h3 style="margin-top:25px;">📦 Récupération client</h3>
        <div class="fact-line">
            <span>Date récup.</span>
            <span>${dateRecup}</span>
        </div>
        <div class="fact-line">
            <span>Heure récup.</span>
            <span>${heureRecup}</span>
        </div>

        <h3 style="margin-top:25px;">💰 Montant</h3>

        <div class="fact-line">
            <span>Estimation</span>
            <span>${f.tarifEstimation || "—"} €</span>
        </div>

        <div class="fact-line" style="border-bottom:2px solid #333;">
            <span>Tarif réel</span>
            <span><strong>${f.tarifReel || "—"} €</strong></span>
        </div>

        <div class="total">
            Total à régler : ${total} €
        </div>

        <br><br>

        <div style="font-size:13px;color:#555;">
            Merci pour votre confiance.<br>
            SAV SOS ORDI 03 — Votre réparateur informatique local.
        </div>
    `;
}

chargerFiche();

// ===========================================
// Génération PDF PRO
// ===========================================
window.generatePDF = async function () {

    const snap = await getDoc(doc(db, "fiches", ficheId));
    const f = snap.data();

    const { jsPDF } = window.jspdf;

    const docPdf = new jsPDF();

    // HEADER
    docPdf.setFontSize(22);
    docPdf.setTextColor(22,163,74);
    docPdf.text("SAV SOS ORDI 03", 10, 20);

    docPdf.setFontSize(12);
    docPdf.setTextColor(0,0,0);
    docPdf.text("Assistance & Dépannage Informatique", 10, 27);

    docPdf.line(10, 32, 200, 32);

    let y = 42;

    function add(label, value) {
        docPdf.setFontSize(12);
        docPdf.text(label, 10, y);
        docPdf.text(String(value || "—"), 120, y);
        y += 8;
    }

    add("Numéro facture :", ficheId);
    add("Date :", new Date().toLocaleDateString());

    y += 4;
    docPdf.setFontSize(14);
    docPdf.text("Client", 10, y);
    y += 8;

    add("Nom :", f.nom);
    add("Téléphone :", f.tel);

    y += 6;
    docPdf.setFontSize(14);
    docPdf.text("Matériel", 10, y);
    y += 8;

    (f.appareils || []).forEach(a => {
        docPdf.text(`• ${a.type} — ${a.marque} ${a.modele}`, 10, y);
        y += 7;
    });

    y += 4;
    docPdf.setFontSize(14);
    docPdf.text("Problème", 10, y);
    y += 8;

    docPdf.setFontSize(11);
    docPdf.text((f.probleme || "—"), 10, y);
    y += 14;

    docPdf.setFontSize(14);
    docPdf.text("Travaux effectués", 10, y);
    y += 8;

    (f.travaux || []).forEach(t => {
        docPdf.text(`• ${t}`, 10, y);
        y += 7;
    });

    y += 4;
    docPdf.setFontSize(14);
    docPdf.text("Montants", 10, y);
    y += 8;

    add("Estimation :", `${f.tarifEstimation || "—"} €`);
    add("Tarif réel :", `${f.tarifReel || "—"} €`);

    y += 10;
    docPdf.setFontSize(18);
    docPdf.setTextColor(22,163,74);
    docPdf.text(`Total : ${f.tarifReel || f.tarifEstimation || "—"} €`, 10, y);

    // Téléchargement
    docPdf.save(`facture-${ficheId}.pdf`);
};

// =============================================
//  SAV — Gestion des statuts avancés
//  SOS ORDI 03 — Version PRO
// =============================================

import { db } from "./firebase-config.js";
import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------------------------------------------
//  LISTE DES STATUTS
// ---------------------------------------------
export const STATUTS = {
    diagnostic: {
        id: "diagnostic",
        label: "En attente de diagnostic",
        color: "#3b82f6", // bleu
        badge: "🟦 Diagnostic"
    },
    piece: {
        id: "piece",
        label: "En attente de pièce",
        color: "#f97316", // orange
        badge: "🟧 Pièce"
    },
    devis: {
        id: "devis",
        label: "Client doit valider devis",
        color: "#a855f7", // violet
        badge: "🟪 Devis"
    },
    repare: {
        id: "repare",
        label: "Réparé",
        color: "#22c55e", // vert
        badge: "🟩 Réparé"
    },
    hs: {
        id: "hs",
        label: "HS OK",
        color: "#dc2626", // rouge
        badge: "🔴 HS"
    },
    abandon: {
        id: "abandon",
        label: "Abandonné",
        color: "#78350f", // brun
        badge: "🟫 Abandonné"
    }
};

// ---------------------------------------------
//  Mise à jour d’un statut dans Firestore
// ---------------------------------------------
export async function setStatut(ficheId, statutId) {

    const statut = STATUTS[statutId];
    if (!statut) {
        alert("Statut inconnu : " + statutId);
        return;
    }

    try {
        await updateDoc(doc(db, "fiches", ficheId), {
            statut: statutId
        });

        alert("✔ Statut mis à jour : " + statut.label);

        // recharge automatique de la page
        location.reload();

    } catch (e) {
        alert("❌ Erreur mise à jour statut : " + e.message);
    }
}

// ---------------------------------------------
//  Génère un badge HTML
// ---------------------------------------------
export function renderBadge(statutId) {
    const statut = STATUTS[statutId];
    if (!statut) return "";

    return `
        <span style="
            background:${statut.color};
            color:white;
            padding:3px 7px;
            border-radius:6px;
            font-size:11px;
            font-weight:700;
            margin-left:6px;
        ">
            ${statut.badge}
        </span>
    `;
}

// ---------------------------------------------
//  Couleur bandeau de la fiche dans historique
// ---------------------------------------------
export function getHeaderStyle(statutId) {
    const statut = STATUTS[statutId];
    if (!statut) return "";

    return `
        border-left:6px solid ${statut.color};
        box-shadow: inset 0 0 0 1000px ${statut.color}20;
    `;
}

// ---------------------------------------------
//  Sélecteur déroulant (choix du statut)
// ---------------------------------------------
export function renderSelect(ficheId, currentStatut) {

    let html = `<select onchange="setStatut('${ficheId}', this.value)" 
                  style="
                    padding:6px;
                    border-radius:8px;
                    border:1px solid #aaa;
                    background:white;
                    font-size:14px;
                    margin-top:8px;
                  ">`;

    html += `<option value="">-- Modifier statut --</option>`;

    for (const key in STATUTS) {
        html += `
            <option value="${key}" ${currentStatut === key ? "selected" : ""}>
                ${STATUTS[key].label}
            </option>
        `;
    }

    html += `</select>`;

    return html;
}

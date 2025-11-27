// =============================================
//  FILTRES HISTORIQUE — SOS ORDI 03
// =============================================

import { STATUTS } from "./sav-status.js";

// Filtres possibles
export const FILTERS = {
    all: { label: "Tous", color: "#111" },
    diagnostic: STATUTS.diagnostic,
    piece: STATUTS.piece,
    devis: STATUTS.devis,
    repare: STATUTS.repare,
    hs: STATUTS.hs,
    abandon: STATUTS.abandon,
};

// Applique un filtre sur les fiches
export function applyFilter(statut) {
    const cards = document.querySelectorAll(".fiche-card");

    cards.forEach(card => {
        const s = card.dataset.statut || "";
        if (statut === "all" || s === statut) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    // gérer couleur bouton actif
    const btns = document.querySelectorAll(".filter-btn");
    btns.forEach(b => b.classList.remove("active"));

    const activeBtn = document.querySelector(`.filter-btn[data-filter="${statut}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

// rendre accessible globalement
window.applyFilter = applyFilter;

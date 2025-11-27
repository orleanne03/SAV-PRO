// =============================================================
//  SAV SOS ORDI 03 — MODULE UI (ACCORDÉONS + SAUVEGARDE)
//  Compatible avec ton HTML :
//  <div class="accordion">
//      <div class="accordion-header">...</div>
//      <div class="accordion-content">...</div>
//  </div>
// =============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------------------------------------
    // 1) ACCORDÉONS GÉNÉRAUX (Accessoires, Travaux, Récupération)
    // ---------------------------------------------------------
    const accordions = document.querySelectorAll(".accordion");

    accordions.forEach(acc => {
        const header = acc.querySelector(".accordion-header");
        const content = acc.querySelector(".accordion-content");

        if (!header || !content) return;

        // Masquer au démarrage
        content.style.display = "none";

        // Clic sur l'en-tête => ouvrir / fermer
        header.addEventListener("click", () => {
            const visible = content.style.display === "block";
            content.style.display = visible ? "none" : "block";

            // Flèche ▼ rotation
            const arrow = header.querySelector(".arrow");
            if (arrow) {
                arrow.style.transition = "transform 0.2s";
                arrow.style.transform = visible ? "rotate(0deg)" : "rotate(180deg)";
            }
        });
    });

    // ---------------------------------------------------------
    // 2) AFFICHAGE DU BLOC "Options de sauvegarde" (acc-sauv)
    //    quand tu choisis "Oui" dans le select #sauv
    // ---------------------------------------------------------
    const sauvSelect = document.getElementById("sauv");
    const accSauv = document.getElementById("acc-sauv");

    if (sauvSelect && accSauv) {
        const updateSauv = () => {
            if (sauvSelect.value === "Oui") {
                accSauv.style.display = "block";
            } else {
                accSauv.style.display = "none";
            }
        };

        // Appliquer au chargement
        updateSauv();

        // Et à chaque changement
        sauvSelect.addEventListener("change", updateSauv);
    }

    console.log("✔ UI (accordéons + sauvegarde) initialisée");
});

// Utilitaires globaux simples
window.msg = (t) => alert(t);
window.$ = (id) => document.getElementById(id);

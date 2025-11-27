// ===========================================
//   MODULE ALERTES — SOS ORDI 03
// ===========================================

export function getAlerts(fiches) {

    const alerts = {
        urgent: [],   // rouge
        warning: [],  // orange
        info: []      // bleu (facultatif)
    };

    const today = new Date();
    today.setHours(0,0,0,0);

    fiches.forEach(f => {

        // -------------------------------
        // AJOUTER : matériel réparé mais pas de date récupération
        // -------------------------------
        if (f.statut === "repare" && (!f.dateRecup || f.dateRecup === "")) {
            alerts.warning.push({
                label: `Réparé mais pas de date prévue`,
                fiche: f
            });
        }

        // -------------------------------
        // ALERTES DATE DE RÉCUPÉRATION
        // -------------------------------
        if (f.dateRecup) {
            const d = new Date(f.dateRecup + "T00:00:00");

            // 🔴 URGENT : date dépassée
            if (d < today && f.statut === "repare") {
                alerts.urgent.push({
                    label: `En retard de récupération : ${f.nom}`,
                    fiche: f
                });
            }

            // 🔴 URGENT : récupération aujourd’hui
            if (d.getTime() === today.getTime() && f.statut === "repare") {
                alerts.urgent.push({
                    label: `À récupérer aujourd'hui : ${f.nom}`,
                    fiche: f
                });
            }
        }

        // -------------------------------
        // INFORMATION : en attente de pièce trop longtemps
        // -------------------------------
        if (f.statut === "piece" && f.date) {
            const depotDate = new Date(f.date);
            const diff = (today - depotDate) / (1000*3600*24);

            if (diff > 10) { // + de 10 jours
                alerts.info.push({
                    label: `Attente pièce (+10j) : ${f.nom}`,
                    fiche: f
                });
            }
        }
    });

    return alerts;
}

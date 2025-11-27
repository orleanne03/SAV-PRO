// ===================================================================
//  SAV — PARTIE UI (popup de fiche) — VERSION FINALE
// ===================================================================

// ---------- FORMATAGE DU TÉLÉPHONE (uniquement formatage !) ----------
function formatTel(input) {
    let v = input.value.replace(/\D/g, "").slice(0, 10);
    input.value = v.replace(/(..)(?=.)/g, "$1-");
}

document.addEventListener("DOMContentLoaded", () => {
    const tel = document.getElementById("tel");
    if (tel) {
        tel.addEventListener("input", () => formatTel(tel));
        formatTel(tel);
    }
});

// ===================================================================
//  MATÉRIEL
// ===================================================================
let appareils = [];

window.ajouterAppareil = function () {
    if (!type.value || !marque.value || !modele.value.trim()) {
        alert("Veuillez remplir Type, Marque et Modèle");
        return;
    }

    appareils.push({
        type: type.value,
        marque: marque.value,
        modele: modele.value.trim()
    });

    afficherAppareils();
    modele.value = "";
};

function afficherAppareils() {
    listeAppareils.innerHTML = appareils.map((a, i) => `
        <div style="padding:6px;border-bottom:1px solid #ccc;display:flex;justify-content:space-between;align-items:center;">
            <span>${a.type} — ${a.marque} ${a.modele}</span>
            <button class="danger small-btn" onclick="supprimerAppareil(${i})">🗑</button>
        </div>
    `).join("");
}

window.supprimerAppareil = function (i) {
    appareils.splice(i, 1);
    afficherAppareils();
};

// ===================================================================
//  MARQUES PAR TYPE
// ===================================================================
const marquesParType = {
    "Ordinateur Portable": ["Acer","Asus","HP","Lenovo","Dell","MSI","Samsung","Toshiba","Fujitsu","LG","Autre"],
    "Ordinateur Fixe": ["Assembler","Acer","Asus","HP","Dell","Lenovo","MSI","Autre"],
    "TOUT EN 1": ["Acer","Asus","HP","Dell","Lenovo","MSI","Autre"],
    "Tablette": ["Samsung","Lenovo","Huawei","Microsoft Surface","Autre"],
    "Disque dur externe": ["Seagate","Western Digital","Toshiba","Samsung","LaCie","Autre"],
    "Écran": ["Samsung","LG","AOC","Iiyama","Philips","Dell","Asus","Autre"],
    "Imprimante": ["HP","Canon","Epson","Brother","Lexmark","Samsung","Autre"],
    "Autre": ["Autre"]
};

window.majMarques = function () {
    marque.innerHTML = "";
    (marquesParType[type.value] || [])
        .forEach(m => marque.innerHTML += `<option>${m}</option>`);
};

// ===================================================================
//  NOM (MAJUSCULES) — NE PAS TOUCHER
// ===================================================================
nom.addEventListener("input", () => {
    nom.value = nom.value.toUpperCase();
});

// ===================================================================
//  POPUP UI (FICHE ÉDITION)
// ===================================================================
window.buildPopupUI = function (data) {

    appareils = data.appareils || [];
    afficherAppareils();

    popupContent.innerHTML = `
        <h2>Modifier la fiche</h2>

        <div class="popup-field">
            <label>Téléphone</label>
            <input id="tel" class="input" type="text" value="${data.tel || ""}">
            <script>
                setTimeout(() => {
                    const tel = document.getElementById("tel");
                    tel.addEventListener("input", () => formatTel(tel));
                    formatTel(tel);
                }, 50);
            </script>
        </div>

        <div class="popup-field">
            <label>Mot de passe</label>
            <input id="mdp" class="input" type="text" value="${data.mdp || ""}">
        </div>

        <div class="popup-field">
            <label>Matériel</label>

            <div id="listeAppareils" style="margin-bottom:10px;"></div>

            <select id="type" onchange="majMarques()" class="input">
                <option value="">Type</option>
                ${Object.keys(marquesParType).map(t => `
                    <option ${data.type === t ? "selected" : ""}>${t}</option>
                `).join("")}
            </select>

            <select id="marque" class="input"></select>

            <input id="modele" class="input" placeholder="Modèle">

            <button onclick="ajouterAppareil()" class="btn-add">Ajouter matériel</button>
        </div>

        <div class="popup-field">
            <label>Problème</label>
            <textarea id="probleme" class="input">${data.probleme || ""}</textarea>
        </div>

        <div class="popup-field">
            <label>Estimation</label>
            <input id="tarifEst" class="input" type="number" value="${data.tarifEst || ""}">
        </div>

        <div class="popup-field">
            <label>Réel</label>
            <input id="tarifReel" class="input" type="number" value="${data.tarifReel || ""}">
        </div>

        <button id="btnSave" class="btn-save">💾 Enregistrer</button>
    `;
};

// ===================================================================
//  FIN DU FICHIER — VERSION PROPRE ET COMPATIBLE
// ===================================================================

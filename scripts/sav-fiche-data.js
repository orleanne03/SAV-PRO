/* =========================================================================
   PC RECONDITIONNÉ — AUTO-COMPLÉTION IDENTIQUE À fiche.html
=========================================================================== */

// ------------------ Variables clients ------------------
let CLIENTS = [];
let clientsReady = false;

// ------------------ Charger cache immédiatement ------------------
const cache = localStorage.getItem("clientsCache");
if (cache) {
    CLIENTS = JSON.parse(cache);
    clientsReady = true;
    console.log("✔ Clients depuis cache :", CLIENTS.length);
}

// ------------------ Charger Firestore APRÈS affichage ------------------
setTimeout(async () => {

    console.log("⏳ Chargement Firestore…");

    try {
        const { db } = await import("./firebase-config.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

        const snap = await firestore.getDocs(firestore.collection(db, "clients"));
        CLIENTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        localStorage.setItem("clientsCache", JSON.stringify(CLIENTS));
        clientsReady = true;

        console.log("✔ Mise à jour Firestore :", CLIENTS.length);

    } catch (e) {
        console.warn("⚠ Firestore KO :", e);
    }

}, 10);


// ===================================================================
// 🔎 AFFICHAGE SUGGESTIONS
// ===================================================================

const nomInput = document.getElementById("nom");
const telInput = document.getElementById("tel");

const sugNomBox = document.getElementById("suggestionsNom");
const sugTelBox = document.getElementById("suggestionsTel");

function hideSuggestions() {
    sugNomBox.style.display = "none";
    sugTelBox.style.display = "none";
}

function afficherSuggestions(list, mode) {

    // 🔥 Empêche la 2e box de suggestions d’apparaître en doublon
    if (mode === "nom") {
        sugTelBox.style.display = "none";
        sugTelBox.innerHTML = "";
    } else {
        sugNomBox.style.display = "none";
        sugNomBox.innerHTML = "";
    }

    const box = mode === "nom" ? sugNomBox : sugTelBox;


    box.innerHTML = "";

    // 1) Afficher les suggestions si on en a
    if (list.length) {
        box.innerHTML = list.map(c => `
            <div class="sug-item" data-nom="${c.nom}" data-tel="${c.tel}">
                <strong>${c.nom}</strong><br>
                <small>${c.tel}</small>
            </div>
        `).join("");
    }

    // 2) Faut-il afficher "Ajouter ce client" ?
    let showAdd = false;

    if (mode === "nom") {
        const saisieNom = nomInput.value.trim();
        if (saisieNom) {
            const upper = saisieNom.toUpperCase();
            const existeDeja = list.some(c => (c.nom || "").toUpperCase() === upper);
            showAdd = !existeDeja;
        }
    } else if (mode === "tel") {
        const digits = telInput.value.replace(/\D/g, "");
        if (digits.length >= 4) {
            const existeDeja = list.some(c =>
                (c.tel || "").replace(/\D/g, "") === digits
            );
            showAdd = !existeDeja;
        }
    }

    if (showAdd) {
        box.innerHTML += `
            <div class="add-client-btn" onclick="ajouterNouveauClient()">
                ➕ Ajouter ce client
            </div>
        `;
    }

    // 3) Affichage / masquage du bloc
    if (!box.innerHTML) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    // clic sur une suggestion = remplissage auto
    box.querySelectorAll(".sug-item").forEach(item => {
        item.addEventListener("click", () => {
            nomInput.value = item.dataset.nom;
            telInput.value = item.dataset.tel;
            hideSuggestions();
        });
    });
}


// ===================================================================
// 🔎 Recherche NOM  —— EXACTEMENT COMME fiche.html
// ===================================================================

nomInput.addEventListener("input", () => {
    if (!clientsReady) return;

    // Nom en majuscule
    nomInput.value = nomInput.value.toUpperCase();

    const val = nomInput.value.trim().toLowerCase();
    if (val.length < 1) {
        hideSuggestions();
        return;
    }

    // 🔥 EXACTEMENT le même filtre que fiche.html :
    const results = CLIENTS.filter(c => {
        if (!c.nom) return false;

        const firstWord = c.nom.toLowerCase().split(" ")[0];
        return firstWord.startsWith(val);
    });

    afficherSuggestions(results, "nom");
});




// ===================================================================
// 🔎 Recherche TÉLÉPHONE —— EXACTEMENT COMME fiche.html
// ===================================================================

telInput.addEventListener("input", () => {
    if (!clientsReady) return;

    // normaliser — supprimer tirets et espaces
    const digits = telInput.value.replace(/\D/g, "");

    // format auto: 06 61 49 97 12
    if (digits.length >= 2 && digits.length <= 10) {
        telInput.value = digits.replace(/(..)(..?)(..?)(..?)/, (m, a, b, c, d) => {
            return [a, b, c, d].filter(Boolean).join("-");
        });
    }

    if (digits.length < 4) {
        hideSuggestions();
        return;
    }

    const results = CLIENTS.filter(c => {
        const telC = (c.tel || "").replace(/\D/g, "");
        return telC.startsWith(digits);
    });

    afficherSuggestions(results, "tel");
});


// ===================================================================
// ➕ Ajouter un nouveau client
// ===================================================================

window.ajouterNouveauClient = async function () {
    if (!nomInput.value.trim() || !telInput.value.trim()) {
        alert("Nom + Téléphone requis");
        return;
    }

    try {
        const { db } = await import("./firebase-config.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

        await firestore.addDoc(firestore.collection(db, "clients"), {
            nom: nomInput.value.trim(),
            tel: telInput.value.trim()
        });

        alert("Client ajouté !");
        hideSuggestions();

    } catch (e) {
        alert("Erreur lors de l’ajout du client.");
        console.error(e);
    }
};


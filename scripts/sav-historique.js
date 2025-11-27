/* ============================================================
   HISTORIQUE SAV — VERSION FINALE MULTI-STATUTS
   BLOC 1 — Firebase + Utils + Statuts + Travaux
============================================================ */

/* ------------------- Firebase Init ------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR8PVlerANOGdzNBwZjj81I6Ajtbn63eI",
    authDomain: "sosordi03-sav.firebaseapp.com",
    projectId: "sosordi03-sav"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ------------------- DOM Elements ------------------- */
const listeZone    = document.getElementById("listeFiches");
const searchInput  = document.getElementById("searchInput");
const filterBtns   = document.querySelectorAll(".filter-btn");

const popup        = document.getElementById("popupFiche");
const popupClose   = document.getElementById("popupClose");
const popupContent = document.getElementById("popupContent");

/* ------------------- Variables globales ------------------- */
let allFiches = [];
let currentFiche = null;
let currentFicheId = null;

/* ------------------- Statuts officiels ------------------- */
/*
   "En cours" = tableau vide
*/
const STATUS_TYPES = [
    { key: "Réparé",            color: "#0c8f3b", bg: "#c8f5c8" },
    { key: "Remplacé",          color: "#0057d9", bg: "#d5e5ff" },
    { key: "Pièces commandées", color: "#cc7a00", bg: "#ffe7c2" },
    { key: "Non réparable",     color: "#a80000", bg: "#ffd2d2" },
];

/* ------------------- Options de TRAVAUX ------------------- */
const TRAVAUX_OPTIONS = [
    "Migration Windows 11",
    "Nettoyage / Optimisation",
    "Réinstallation Windows",
    "Installation SSD",
    "Clonage disque",
    "Ajout RAM",
    "Autre"
];

/* ------------------- Utils ------------------- */
function escapeHTML(str = "") {
    return String(str).replace(/[&<>"']/g, s => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[s] || s));
}

/* Convertir anciens statuts → tableau */
function normalizeStatus(f) {
    if (!f.statut) return [];

    if (Array.isArray(f.statut)) return f.statut;

    if (typeof f.statut === "string") {
        if (f.statut === "En cours" || f.statut.trim() === "") return [];
        return [f.statut];
    }

    return [];
}

function getStatusList(f) {
    return normalizeStatus(f);
}

/* Afficher badges multi-statuts */
function renderStatusBadges(f) {
    const statuses = getStatusList(f);

    if (statuses.length === 0) {
        return `<span class="fiche-status" style="background:#bde4c6;color:#0b5c2c;">En cours</span>`;
    }

    return statuses.map(s => {
        const st = STATUS_TYPES.find(x => x.key === s);
        if (!st) {
            return `<span class="fiche-status">${escapeHTML(s)}</span>`;
        }
        return `<span class="fiche-status" style="background:${st.bg};color:${st.color};">${st.key}</span>`;
    }).join(" ");
}

/* Filtrage */
function matchFilter(f, filter) {
    const statuses = getStatusList(f);

    if (filter === "Tous") return true;
    if (filter === "En cours") return statuses.length === 0;

    return statuses.includes(filter);
}
/* ============================================================
   BLOC 2 — Chargement Firestore + Liste + Recherche + Filtres
============================================================ */

/* Charger les fiches ----------------------------- */
async function loadFiches() {
  try {
      const snap = await getDocs(
          query(collection(db, "fiches"), orderBy("date", "desc"))
      );

      allFiches = snap.docs.map(d => {
          const data = d.data();
          return {
              id: d.id,
              ...data,
              statut: normalizeStatus(data)   // conversion auto
          };
      });

      renderFiches("Tous");

  } catch (e) {
      console.error(e);
      listeZone.innerHTML = "<p style='color:red;text-align:center;'>Erreur de chargement.</p>";
  }
}

/* Extraire nom du matériel ----------------------- */
function getAppareil(f) {
  if (f.type || f.marque || f.modele) {
      return `${f.type || ""} ${f.marque || ""} ${f.modele || ""}`.trim();
  }

  if (f.appareils && f.appareils[0]) {
      const a = f.appareils[0];
      return `${a.type || ""} ${a.marque || ""} ${a.modele || ""}`.trim();
  }

  return "Non renseigné";
}

/* Affichage liste SAV ---------------------------- */
function renderFiches(filter) {
  let filtered = [...allFiches];
  // Ne pas afficher les fiches archivées
filtered = filtered.filter(f => f.archive !== true);


  const search = searchInput.value.toLowerCase().trim();

  /* Recherche */
  if (search) {
      filtered = filtered.filter(f =>
          (f.nom || "").toLowerCase().includes(search) ||
          (f.tel || "").replace(/\D/g, "").includes(search) ||
          (f.marque || "").toLowerCase().includes(search) ||
          (f.modele || "").toLowerCase().includes(search) ||
          JSON.stringify(f.appareils || "").toLowerCase().includes(search)
      );
  }

  /* Filtre multi-statuts */
  filtered = filtered.filter(f => matchFilter(f, filter));

  /* Reset affichage */
  listeZone.innerHTML = "";

  if (!filtered.length) {
      listeZone.innerHTML = `<div class="fiche-card">Aucune fiche trouvée</div>`;
      return;
  }

  /* Génération des cartes */
  filtered.forEach(f => {
      const appareil = getAppareil(f);

      const dateArrivee = f.date
          ? new Date(f.date).toLocaleDateString("fr-FR")
          : "—";

      const dateRecup = f.dateRecup
          ? new Date(f.dateRecup).toLocaleDateString("fr-FR")
          : null;

          const card = document.createElement("div");
          card.className = "fiche-card";   // on garde le style d’origine
          
// Statuts normalisés
const statuses = getStatusList(f).map(s =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
);

// 🎨 Couleurs selon TES vrais statuts Firestore

// RÉPARÉ
if (statuses.includes("repare")) {
    card.classList.add("status-repare");
}

// REMPLACÉ ou REMPLACEMENT
if (statuses.includes("remplace") || statuses.includes("remplacement")) {
    card.classList.add("status-remplace");
}

// NON RÉPARABLE / HS
if (statuses.includes("hs ok") || statuses.includes("hsok") || statuses.includes("hs")) {
    card.classList.add("status-nonrep");
}


          


        

      card.innerHTML = `
          <div class="fiche-header-row">
              <div>
                  <strong>${escapeHTML(f.nom || "—")}</strong><br>
                  <small>📞 ${escapeHTML(f.tel || "—")}</small><br>
                  <small>💻 ${escapeHTML(appareil)}</small><br>
                  <small>📅 Arrivé : ${dateArrivee}</small><br>

                  ${
                      (dateRecup && f.heureRecup)
                      ? `<small>📦 Récupéré : ${dateRecup} à ${escapeHTML(f.heureRecup)}</small><br>`
                      : ""
                  }

                  <div style="margin-top:6px;">
                      ${renderStatusBadges(f)}
                  </div>
              </div>
          </div>
      `;

      card.addEventListener("click", () => openPopup(f.id));
      listeZone.appendChild(card);
  });
}

/* Recherche live ------------------------------- */
searchInput.addEventListener("input", () => {
  const active = document.querySelector(".filter-btn.active").dataset.filter;
  renderFiches(active);
});

/* Filtres ------------------------------- */
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderFiches(btn.dataset.filter);
  });
});
/* ============================================================
   BLOC 3 — Popup MODE LECTURE (affichage simple)
============================================================ */

async function openPopup(id) {
  popup.style.display = "flex";
  popupContent.innerHTML = "Chargement...";

  const snap = await getDoc(doc(db, "fiches", id));

  if (!snap.exists()) {
      popupContent.innerHTML = "<p style='color:red'>Fiche introuvable.</p>";
      return;
  }

  currentFicheId = id;
  currentFiche = { id, ...snap.data() };
  currentFiche.statut = normalizeStatus(currentFiche);

  renderPopupViewMode();
}

/* Affichage lecture seule */
function renderPopupViewMode() {
  const f = currentFiche;
  if (!f) return;

  const appareil = getAppareil(f);

  const dateRecupStr = f.dateRecup
      ? new Date(f.dateRecup).toLocaleDateString("fr-FR")
      : "—";

  const heureRecupStr = f.heureRecup || "";

  popupContent.innerHTML = `
      <h2>${escapeHTML(f.nom || "—")}</h2>

      <div class="popup-section">
          <p><strong>📞 Téléphone :</strong> ${escapeHTML(f.tel || "—")}</p>
          <p><strong>💻 Matériel :</strong> ${escapeHTML(appareil)}</p>
          <p><strong>🔐 Mot de passe :</strong> ${escapeHTML(f.motdepasse || "—")}</p>
      </div>

      <div class="popup-section">
          <p><strong>📝 Problème :</strong><br>${escapeHTML(f.probleme || "—")}</p>
      </div>

      <div class="popup-section">
          <p><strong>🔧 Travaux :</strong><br>${
              f.travaux?.length
                  ? f.travaux.map(t => escapeHTML(t)).join("<br>")
                  : "—"
          }</p>
      </div>

      <div class="popup-section">
          <p><strong>💰 Estimation :</strong> ${escapeHTML(f.tarifEstimation || "—")}</p>
          <p><strong>💰 Réel :</strong> ${escapeHTML(f.tarifReel || "—")}</p>
      </div>

      <div class="popup-section">
          <p><strong>📌 Statuts :</strong></p>
          <div>${renderStatusBadges(f)}</div>
      </div>

      <div class="popup-section">
          <p><strong>📦 Récupération client :</strong></p>
          <p>${f.dateRecup ? "📅 " + dateRecupStr : "—"}</p>
          <p>${heureRecupStr ? "⏰ " + escapeHTML(heureRecupStr) : ""}</p>
      </div>

      <div class="popup-actions">

    <button class="popup-btn btn-grey" id="btn-edit-popup">
        ✏ Modifier dans la popup
    </button>

    ${
        f.archive === true
        ? `<button class="popup-btn btn-green" onclick="desarchiverFiche('${f.id}')">♻ Désarchiver</button>`
        : `<button class="popup-btn btn-orange" onclick="archiveFiche('${f.id}')">📦 Archiver</button>`
    }

</div>

  `;

  document.getElementById("btn-edit-popup")
      .addEventListener("click", renderPopupEditMode);
}
/* ============================================================
   BLOC 4 — Popup MODE ÉDITION (multi-statuts)
============================================================ */

function renderPopupEditMode() {
  const f = currentFiche;
  if (!f) return;

  const appareil = getAppareil(f);

  /* Statuts sélectionnés (Set pour toggle simple) */
  const selected = new Set(getStatusList(f));

  /* Date récup format YYYY-MM-DD */
  const dateRecupValue = f.dateRecup
      ? new Date(f.dateRecup).toISOString().split("T")[0]
      : "";

  popupContent.innerHTML = `
      <h2>${escapeHTML(f.nom || "—")} <span style="font-size:13px;">(édition)</span></h2>

      <!-- Téléphone + matériel -->
      <div class="popup-section">
          <p><strong>📞 Téléphone :</strong><br>
              <input id="edit-tel" type="text" value="${escapeHTML(f.tel || "")}"
                  style="width:100%;padding:8px;border-radius:8px;border:1px solid #bde4c6;">
          </p>
          <p><strong>💻 Matériel :</strong> ${escapeHTML(appareil)}</p>
      </div>

      <!-- Problème -->
      <div class="popup-section">
          <p><strong>📝 Problème :</strong><br>
              <textarea id="edit-probleme" rows="3"
                  style="width:100%;padding:8px;border-radius:8px;border:1px solid #bde4c6;">${escapeHTML(f.probleme || "")}</textarea>
          </p>
      </div>

      <!-- Travaux -->
      <div class="popup-section">
          <p><strong>🔧 Travaux :</strong></p>
          ${TRAVAUX_OPTIONS.map(t => `
              <label style="display:block;font-size:14px;margin-bottom:4px;">
                  <input type="checkbox" class="edit-travaux" value="${t}"
                      ${f.travaux?.includes(t) ? "checked" : ""}>
                  ${t}
              </label>
          `).join("")}
      </div>

      <!-- Tarifs -->
      <div class="popup-section">
          <p><strong>💰 Estimation :</strong><br>
              <input id="edit-tarif-est" type="text" value="${escapeHTML(f.tarifEstimation || "")}"
                  style="width:100%;padding:8px;border-radius:8px;border:1px solid #bde4c6;">
          </p>
          <p><strong>💰 Réel :</strong><br>
              <input id="edit-tarif-reel" type="text" value="${escapeHTML(f.tarifReel || "")}"
                  style="width:100%;padding:8px;border-radius:8px;border:1px solid #bde4c6;">
          </p>
      </div>

      <!-- Statuts multi-select -->
      <div class="popup-section">
          <p><strong>📌 Statuts :</strong></p>

          <div id="status-buttons" style="display:flex;gap:10px;flex-wrap:wrap;">
              ${STATUS_TYPES.map(s => `
                  <button 
                      type="button"
                      class="status-toggle ${selected.has(s.key) ? 'active' : ''}"
                      data-status="${s.key}"
                      style="--c:${s.color};">
                      ${s.key}
                  </button>
              `).join("")}
          </div>

          ${
              selected.size === 0
              ? `<p style="margin-top:8px;font-weight:bold;">Statut réel : En cours</p>`
              : ""
          }
      </div>

      <!-- Récupération client -->
      <div class="popup-section">
          <p><strong>📦 Récupération client :</strong></p>
          <p>
              Date :
              <input id="edit-date-recup" type="date"
                     value="${dateRecupValue}"
                     style="padding:6px;border-radius:6px;border:1px solid #bde4c6;">
          </p>
          <p>
              Heure :
              <input id="edit-heure-recup" type="time"
                     value="${escapeHTML(f.heureRecup || "")}"
                     style="padding:6px;border-radius:6px;border:1px solid #bde4c6;">
          </p>
      </div>

      <!-- Boutons action -->
      <div class="popup-actions">
          <button class="popup-btn btn-grey" id="btn-cancel-edit">↩ Annuler</button>
          <button class="popup-btn btn-green" id="btn-save-edit">💾 Enregistrer</button>
      </div>
  `;

  /* === Toggle statuts — VERSION CORRIGÉE === */
  const statusButtons = popupContent.querySelectorAll(".status-toggle");
  const selectedSet = new Set(selected);

  statusButtons.forEach(btn => {
      btn.addEventListener("click", () => {
          const status = btn.dataset.status;

          // Toggle visuel immédiat
          btn.classList.toggle("active");

          // Toggle logique interne
          if (selectedSet.has(status)) {
              selectedSet.delete(status);
          } else {
              selectedSet.add(status);
          }

          // On sauvegarde pour savePopupEdits()
          currentFiche._tempSelectedStatuses = [...selectedSet];
      });
  });

  /* Boutons bas */
  document.getElementById("btn-cancel-edit")
      .addEventListener("click", renderPopupViewMode);

  document.getElementById("btn-save-edit")
      .addEventListener("click", savePopupEdits);
}
/* ============================================================
   BLOC 5 — Sauvegarde Firestore + Toggle rapide + Init
============================================================ */

/* ----------- Enregistrer modifications ----------- */
async function savePopupEdits() {
  if (!currentFiche || !currentFicheId) return;

  const f = currentFiche;

  /* Lire les champs */
  const tel        = document.getElementById("edit-tel").value.trim();
  const probleme   = document.getElementById("edit-probleme").value.trim();
  const tarifEst   = document.getElementById("edit-tarif-est").value.trim();
  const tarifReel  = document.getElementById("edit-tarif-reel").value.trim();
  const dateRecup  = document.getElementById("edit-date-recup").value || null;
  const heureRecup = document.getElementById("edit-heure-recup").value || null;

  /* Travaux */
  const travaux = Array.from(document.querySelectorAll(".edit-travaux"))
                      .filter(x => x.checked)
                      .map(x => x.value);

  /* Statuts multi */
  let statuses = [];
  if (f._tempSelectedStatuses) {
      statuses = [...f._tempSelectedStatuses];
  } else {
      statuses = getStatusList(f);
  }

  const newData = {
      tel,
      probleme,
      travaux,
      tarifEstimation: tarifEst,
      tarifReel,
      dateRecup,
      heureRecup,
      statut: statuses  // tableau multi-statuts
  };

  try {
      await updateDoc(doc(db, "fiches", currentFicheId), newData);

      alert("Modifications enregistrées !");
      delete currentFiche._tempSelectedStatuses;

      loadFiches();
      renderPopupViewMode();

  } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
  }
}

/* ----------- Toggle rapide statuts depuis VIEW MODE ----------- */
window.changeStatut = async function (id, status) {
  const snap = await getDoc(doc(db, "fiches", id));
  if (!snap.exists()) return alert("Fiche introuvable");

  let f = snap.data();
  let statuses = normalizeStatus(f);

  /* toggle */
  if (statuses.includes(status)) {
      statuses = statuses.filter(s => s !== status);
  } else {
      statuses.push(status);
  }

  try {
      await updateDoc(doc(db, "fiches", id), { statut: statuses });

      alert("Statut mis à jour !");
      closePopup();
      loadFiches();

  } catch (e) {
      console.error(e);
      alert("Erreur mise à jour statut");
  }
};
// ============================================================
// ARCHIVER UNE FICHE
// ============================================================
window.archiveFiche = async function(id) {
  if (!confirm("Archiver cette fiche ?\nElle ne sera plus visible dans l'historique, mais restera disponible pour les statistiques.")) {
      return;
  }

  try {
      await updateDoc(doc(db, "fiches", id), {
          archive: true
      });

      alert("Fiche archivée !");
      closePopup();
      loadFiches();

  } catch (e) {
      console.error(e);
      alert("Erreur lors de l'archivage.");
  }
};
// ============================================================
// DÉSARCHIVER UNE FICHE
// ============================================================
window.desarchiverFiche = async function(id) {
  if (!confirm("Désarchiver cette fiche ?\nElle réapparaîtra dans l'historique SAV.")) {
      return;
  }

  try {
      await updateDoc(doc(db, "fiches", id), {
          archive: false
      });

      alert("Fiche désarchivée !");
      closePopup();
      loadFiches();

  } catch (e) {
      console.error(e);
      alert("Erreur lors de la désarchivation.");
  }
};

/* ----------- Fermer popup ----------- */
function closePopup() {
  popup.style.display = "none";
}

popupClose.addEventListener("click", closePopup);

popup.addEventListener("click", e => {
  if (e.target === popup) closePopup();
});

/* ----------- Initialisation globale ----------- */
function init() {
  loadFiches();
}
window.dumpStatuses = function () {
    console.log("===== STATUTS REELS =====");
    allFiches.forEach(f => console.log(f.nom, f.statut));
};

init();

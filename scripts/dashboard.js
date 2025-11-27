// =============================================
// DASHBOARD — SOS ORDI 03
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { STATUTS } from "./sav-status.js";
import { getAlerts } from "./alert-module.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAR8PVlerANOGdzNBwZjj81I6Ajtbn63eI",
    authDomain: "sosordi03-sav.firebaseapp.com",
    projectId: "sosordi03-sav"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ELEMENTS HTML
const alertContainer = document.getElementById("alertContainer");
const totalFiches = document.getElementById("totalFiches");
const totalRep = document.getElementById("totalRep");
const totalHS = document.getElementById("totalHS");

const caEst = document.getElementById("caEst");
const caReel = document.getElementById("caReel");
const tauxRep = document.getElementById("tauxRep");

const statutList = document.getElementById("statutList");
const topMarque = document.getElementById("topMarque");

const pieceCommandee = document.getElementById("pieceCommandee");
const pieceRecue = document.getElementById("pieceRecue");
const pieceInstallee = document.getElementById("pieceInstallee");
const pieceRetard = document.getElementById("pieceRetard");

// --------------------------------------
// LOAD DASHBOARD
// --------------------------------------
async function loadDashboard() {

    // FICHES SAV
    const snapFiches = await getDocs(collection(db, "fiches"));
    const fiches = snapFiches.docs.map(d => d.data());

    // PIÈCES
    const snapPieces = await getDocs(collection(db, "pieces"));
    const pieces = snapPieces.docs.map(d => d.data());

    // --------------------------------------
    // 1 — ALERTES
    // --------------------------------------
    const alerts = getAlerts(fiches);

    alertContainer.innerHTML = "";

    alerts.urgent.forEach(a => {
        alertContainer.innerHTML += `
            <div class="alert-block alert-red">🔴 ${a.label}</div>
        `;
    });

    alerts.warning.forEach(a => {
        alertContainer.innerHTML += `
            <div class="alert-block alert-orange">🟧 ${a.label}</div>
        `;
    });

    alerts.info.forEach(a => {
        alertContainer.innerHTML += `
            <div class="alert-block alert-blue">🔵 ${a.label}</div>
        `;
    });

    // --------------------------------------
    // 2 — FICHES
    // --------------------------------------
    totalFiches.textContent = fiches.length;
    totalRep.textContent = fiches.filter(f => f.statut === "repare").length;
    totalHS.textContent = fiches.filter(f => f.statut === "hs").length;

    // --------------------------------------
    // 3 — CHIFFRES
    // --------------------------------------
    let est = 0, reel = 0;

    fiches.forEach(f => {
        if (f.tarifEstimation) est += parseFloat(f.tarifEstimation);
        if (f.tarifReel) reel += parseFloat(f.tarifReel);
    });

    caEst.textContent = est.toFixed(2) + " €";
    caReel.textContent = reel.toFixed(2) + " €";

    tauxRep.textContent = fiches.length
        ? Math.round((fiches.filter(f => f.statut === "repare").length / fiches.length) * 100) + "%"
        : "0%";

    // --------------------------------------
    // 4 — STATUTS
    // --------------------------------------
    statutList.innerHTML = "";

    for (const id in STATUTS) {
        const nb = fiches.filter(f => f.statut === id).length;
        statutList.innerHTML += `
            <div>
                <b>${STATUTS[id].label}</b>
                <span>${nb}</span>
            </div>
        `;
    }

    // --------------------------------------
    // 5 — MARQUE LA PLUS RÉPARÉE
    // --------------------------------------
    const countMarques = {};

    fiches.forEach(f => {
        if (!f.appareils) return;
        f.appareils.forEach(a => {
            if (!a.marque) return;
            countMarques[a.marque] = (countMarques[a.marque] || 0) + 1;
        });
    });

    let top = "—";
    let max = 0;

    for (const m in countMarques) {
        if (countMarques[m] > max) {
            top = m;
            max = countMarques[m];
        }
    }

    topMarque.textContent = top;

    // --------------------------------------
    // 6 — PIÈCES EN COMMANDE
    // --------------------------------------
    const cmd = pieces.filter(p => p.statut === "commande").length;
    const rec = pieces.filter(p => p.statut === "reçue").length;
    const inst = pieces.filter(p => p.statut === "installee").length;

    const retard = pieces.filter(p => {
        if (!p.date) return false;
        let d = new Date(p.date);
        let diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
        return diff > 12 && p.statut !== "installee";
    }).length;

    pieceCommandee.textContent = cmd;
    pieceRecue.textContent = rec;
    pieceInstallee.textContent = inst;
    pieceRetard.textContent = retard;
}

loadDashboard();

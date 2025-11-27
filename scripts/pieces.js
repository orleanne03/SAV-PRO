import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs,
    deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR8PVlerANOGdzNBwZjj81I6Ajtbn63eI",
    authDomain: "sosordi03-sav.firebaseapp.com",
    projectId: "sosordi03-sav"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const list = document.getElementById("piecesList");

function badge(statut) {
    switch(statut){
        case "commande": return `<span class="badge b-orange">Commandée</span>`;
        case "expediee": return `<span class="badge b-blue">Expédiée</span>`;
        case "reçue": return `<span class="badge b-purple">Reçue</span>`;
        case "installee": return `<span class="badge b-green">Installée</span>`;
        default: return "";
    }
}

export async function addPiece() {
    const data = {
        nom: document.getElementById("p_nom").value,
        fournisseur: document.getElementById("p_fournisseur").value,
        prix: document.getElementById("p_prix").value,
        fiche: document.getElementById("p_fiche").value,
        statut: document.getElementById("p_statut").value,
        date: new Date().toISOString()
    };

    await addDoc(collection(db, "pieces"), data);
    alert("Pièce ajoutée !");
    location.reload();
}

window.addPiece = addPiece;

async function loadPieces() {
    const snap = await getDocs(collection(db, "pieces"));
    list.innerHTML = "";

    snap.forEach(d => {
        const p = d.data();

        list.innerHTML += `
        <tr>
            <td>${p.nom}</td>
            <td>${p.fournisseur}</td>
            <td>${p.prix} €</td>
            <td>${badge(p.statut)}</td>
            <td><a href="fiche.html?id=${p.fiche}">Voir fiche</a></td>
            <td>
                <button onclick="updatePiece('${d.id}', 'reçue')">📦 Reçue</button>
                <button onclick="updatePiece('${d.id}', 'installee')">🔧 Installée</button>
                <button onclick="supprimerPiece('${d.id}')">🗑</button>
            </td>
        </tr>
        `;
    });
}

window.updatePiece = async function(id, statut) {
    await updateDoc(doc(db, "pieces", id), { statut });
    alert("Statut mis à jour !");
    location.reload();
}

window.supprimerPiece = async function(id) {
    if (!confirm("Supprimer ?")) return;
    await deleteDoc(doc(db, "pieces", id));
    location.reload();
}

loadPieces();

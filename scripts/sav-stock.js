import { db } from "./firebase-config.js";
import { 
    collection, addDoc, getDocs, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let stock = [];
let history = [];

// ===========================
// LOAD STOCK
// ===========================
async function loadStock() {
    const snap = await getDocs(collection(db,"stock"));
    stock = [];
    snap.forEach(d => stock.push({ id:d.id, ...d.data() }));
    renderStock();
}

async function loadHistory() {
    const snap = await getDocs(collection(db,"stock_history"));
    history = [];
    snap.forEach(d => history.push(d.data()));
    renderHistory();
}

loadStock();
loadHistory();

// ===========================
// ADD ITEM
// ===========================
window.stockAdd = async () => {
    const nom = sNom.value.trim();
    const qty = Number(sQty.value);

    if (!nom || !qty) return alert("Champ vide");

    await addDoc(collection(db,"stock"), {
        nom,
        qty
    });

    await addDoc(collection(db,"stock_history"), {
        type:"in",
        nom,
        qty,
        date:new Date().toISOString()
    });

    loadStock();
    loadHistory();
};

// ===========================
// RENDER
// ===========================
function renderStock() {
    stockList.innerHTML = stock.map(s => `
        <div class="card">
            <b>${s.nom}</b><br>
            Quantité : ${s.qty}<br>
            <button class="btn btn-danger" onclick="stockUse('${s.id}')">Utiliser 1</button>
        </div>
    `).join("");
}

function renderHistory() {
    stockHistory.innerHTML = history.map(h => `
        <div class="card">
            <b>${h.nom}</b> — ${h.type === "in" ? "+" : "-"}${h.qty}<br>
            <span class="small">${new Date(h.date).toLocaleString()}</span>
        </div>
    `).join("");
}

// ===========================
// USE STOCK
// ===========================
window.stockUse = async (id) => {
    const item = stock.find(s => s.id === id);
    if (!item) return;

    if (item.qty <= 0) return alert("Stock épuisé");

    await updateDoc(doc(db,"stock",id), {
        qty: item.qty - 1
    });

    await addDoc(collection(db,"stock_history"), {
        type:"out",
        nom:item.nom,
        qty:1,
        date:new Date().toISOString()
    });

    loadStock();
    loadHistory();
};

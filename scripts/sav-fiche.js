
// ======================================================================
//  SAV SOS ORDI 03 — sav-fiche.js (Version Optimisée & Fonctionnelle)
// ======================================================================

// ---------------------------------------------------------
// FORMATAGE NOM & TELEPHONE
// ---------------------------------------------------------
tel.addEventListener("input", () => {
    // garder uniquement les chiffres
    let v = tel.value.replace(/\D/g, "");

    // max 10 chiffres
    if (v.length > 10) v = v.slice(0, 10);

    // groupe en paires : 0612345678 -> 06-12-34-56-78
    let formatted = v.replace(/(.{2})/g, "$1-");
    if (formatted.endsWith("-")) {
        formatted = formatted.slice(0, -1);
    }

    tel.value = formatted;
});


// ---------------------------------------------------------
// ACCORDEONS UI
// ---------------------------------------------------------
document.querySelectorAll(".accordion-header").forEach(h => {
    h.addEventListener("click", () => {
        h.parentElement.classList.toggle("open");
        const c = h.nextElementSibling;
        c.style.display = c.style.display === "block" ? "none" : "block";
    });
});

// ---------------------------------------------------------
// MATERIEL
// ---------------------------------------------------------
let appareils = [];
window.ajouterAppareil = function() {
    if(!type.value || !marque.value || !modele.value.trim()) return alert("Remplir tous les champs");
    appareils.push({ type: type.value, marque: marque.value, modele: modele.value.trim() });
    afficherAppareils();
    modele.value = "";
};
function afficherAppareils() {
    listeAppareils.innerHTML = appareils.map((a,i)=>`
        <div style="padding:6px;border-bottom:1px solid #ccc;">
            ${a.type} — ${a.marque} ${a.modele}
            <button class="danger small-btn" onclick="supprimerAppareil(${i})">🗑</button>
        </div>`).join("");
}
window.supprimerAppareil = i => { appareils.splice(i,1); afficherAppareils(); };

const marquesParType = {
    "Ordinateur Portable":["Acer","Asus","HP","Lenovo","Dell","MSI","Samsung","Toshiba","Fujitsu","LG","Autre"],
    "Ordinateur Fixe":["Assembler","Acer","Asus","HP","Dell","Lenovo","MSI","Autre"],
    "TOUT EN 1":["Acer","Asus","HP","Dell","Lenovo","MSI","Autre"],
    "Tablette":["Samsung","Lenovo","Huawei","Microsoft Surface","Autre"],
    "Disque dur externe":["Seagate","Western Digital","Toshiba","Samsung","LaCie","Autre"],
    "Écran":["Samsung","LG","AOC","Iiyama","Philips","Dell","Asus","Autre"],
    "Imprimante":["HP","Canon","Epson","Brother","Lexmark","Samsung","Autre"],
    "Autre":["Autre"]
};
window.majMarques = () => {
    marque.innerHTML = "";
    (marquesParType[type.value]||[]).forEach(m=>{
        marque.innerHTML += `<option>${m}</option>`;
    });
};

// ---------------------------------------------------------
// FIRESTORE + AUTOCOMPLETE + EDITION
// ---------------------------------------------------------
window.addEventListener("load", async () => {
    const { db } = await import("./firebase-config.js");
    const { collection, getDocs, addDoc, getDoc, updateDoc, doc } =
        await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

    // AUTOCOMPLETE
    let clients = [];
    let cache = localStorage.getItem("clientsCache");
    if(cache){
        clients = JSON.parse(cache);
    }
    (async()=>{
        const snap = await getDocs(collection(db,"clients"));
        clients = snap.docs.map(d=>({id:d.id, ...d.data()}));
        localStorage.setItem("clientsCache", JSON.stringify(clients));
    })();

    nom.addEventListener("input", ()=>{
        const v = nom.value.trim().toLowerCase();
        if(v.length<1) return hideAllSuggestions();
        afficherSuggestions(clients.filter(c=>{
            if(!c.nom) return false;
            const first = c.nom.toLowerCase().split(" ")[0];
            return first.startsWith(v);
        }),"nom");
    });

    tel.addEventListener("input", ()=>{
        const d = tel.value.replace(/\D/g,"");
        if(d.length<4) return hideAllSuggestions();
        afficherSuggestions(clients.filter(c=>{
            return (c.tel||"").replace(/\D/g,"").startsWith(d);
        }),"tel");
    });

    window.remplirClient = (n,t)=>{
        nom.value=n;
        tel.value=t;
        hideAllSuggestions();
    };

    window.ajouterNouveauClient = async ()=>{
        if(!nom.value.trim()||!tel.value.trim()) return alert("Nom + Téléphone requis");
        await addDoc(collection(db,"clients"),{nom:nom.value.trim(), tel:tel.value.trim()});
        alert("Client ajouté !");
    };

    function afficherSuggestions(list, mode){
        const box = mode==="nom" ? suggestionsNom : suggestionsTel;
        box.innerHTML="";
        box.style.display="block";
    
        if(list.length === 0){
            box.innerHTML = `
                <div class="add-client-btn" onclick="ajouterNouveauClient()">
                    ➕ Ajouter ce client
                </div>`;
            return;
        }
    
        list.forEach(c=>{
            box.innerHTML += `
                <div class="sug-item" onclick="remplirClient('${c.nom}','${c.tel}')">
                    ${c.nom} — ${c.tel}
                </div>`;
        });
    
        // Bouton d’ajout *uniquement si aucune correspondance exacte*
        const saisieNom = nom.value.trim().toUpperCase();
        const correspondanceExacte = list.some(c => c.nom.toUpperCase() === saisieNom);
    
        if(!correspondanceExacte){
            box.innerHTML += `
                <div class="add-client-btn" onclick="ajouterNouveauClient()">
                    ➕ Ajouter ce client
                </div>`;
        }
    }
    

    // MODE EDITION
    const params = new URLSearchParams(window.location.search);
    const ficheId = params.get("id");
    window.ficheId = ficheId;

    if(ficheId){
        const snap = await getDoc(doc(db,"fiches",ficheId));
        if(snap.exists()){
            const data = snap.data();
            nom.value = data.nom||"";
            tel.value = data.tel||"";
            couleur.value = data.couleur||"";
            dateArrivee.value = data.dateArrivee||"";
            probleme.value = data.probleme||"";
            tarifEst.value = data.tarifEst||"";
            tarifReel.value = data.tarifReel||"";
            mdp.value = data.mdp||"";
            sauv.value = data.sauv||"Non";
            dateRecup.value = data.dateRecup||"";
            heureRecup.value = data.heureRecup||"";

            appareils = data.appareils||[];
            afficherAppareils();

            document.querySelectorAll(".status-btn").forEach(btn=>{
                btn.classList.remove("active");
                if(btn.dataset.status === data.statut) btn.classList.add("active");
            });

            document.querySelectorAll(".accBox").forEach(ch=>{
                ch.checked = (data.accessoires||[]).includes(ch.value);
            });

            document.querySelectorAll(".travBox").forEach(ch=>{
                ch.checked = (data.travaux||[]).includes(ch.value);
            });

            if(data.sauv==="Oui") accSauv.style.display="block";

            document.querySelectorAll(".sauvBox").forEach(ch=>{
                ch.checked = (data.sauvOptions||[]).includes(ch.value);
            });
        }
    }

    // ENREGISTRER
    btnSave.addEventListener("click", async ()=>{
        const data = {
            nom: nom.value.trim(),
            tel: tel.value.trim(),
            couleur: couleur.value,
            dateArrivee: dateArrivee.value,
            probleme: probleme.value,
            tarifEst: tarifEst.value,
            tarifReel: tarifReel.value,
            mdp: mdp.value,
            sauv: sauv.value,
            dateRecup: dateRecup.value,
            heureRecup: heureRecup.value,
            appareils,
            accessoires: [...document.querySelectorAll(".accBox:checked")].map(c=>c.value),
            travaux: [...document.querySelectorAll(".travBox:checked")].map(c=>c.value),
            statut: document.querySelector(".status-btn.active").dataset.status,
            sauvOptions: [...document.querySelectorAll(".sauvBox:checked")].map(c=>c.value),
            dateModif: new Date().toISOString()
        };

        if(window.ficheId){
            await updateDoc(doc(db,"fiches",window.ficheId), data);
            alert("✔ Fiche mise à jour !");
        } else {
            data.dateCreation=new Date().toISOString();
            await addDoc(collection(db,"fiches"), data);
            alert("✔ Nouvelle fiche créée !");
        }
        window.location.href="historique.html";
    });

});

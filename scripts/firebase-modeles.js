import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function getMarques() {
    const ref = collection(db, "modeles");
    const snap = await getDocs(ref);

    return snap.docs.map(doc => doc.data().marque);
}

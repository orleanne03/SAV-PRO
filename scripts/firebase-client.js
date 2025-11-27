import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function getClients() {
    const ref = collection(db, "clients");
    const snap = await getDocs(ref);

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

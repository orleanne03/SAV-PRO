// =============================================================
//  SAV SOS ORDI 03 — MODULE UPLOAD (DÉSACTIVÉ)
// =============================================================
//
//  Tu as choisi de désactiver complètement l’upload photo.
//  Ce module est donc neutralisé proprement pour éviter
//  les erreurs dans les autres scripts.
//
//  Les anciennes photos dans Firebase restent visibles.
//
// =============================================================

// Fonction neutre (ne fait rien mais évite les erreurs)
function disabledUpload() {
    console.warn("📸 Upload photo désactivé (fonction volontairement inactive).");
    alert("L’option photo n’est plus disponible.");
}

// ---------------------------------------------------------------
// API exposée pour les pages HTML (pour éviter erreurs JS)
// ---------------------------------------------------------------
window.uploadPhotoAvant = disabledUpload;
window.uploadPhotoApres = disabledUpload;
window.uploadSignDep = disabledUpload;
window.uploadSignRec = disabledUpload;

// ---------------------------------------------------------------
// Rien d’autre à faire : tout est propre maintenant
// ---------------------------------------------------------------

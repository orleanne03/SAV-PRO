// ============================================
// Supabase Storage - SOS ORDI 03
// ============================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Tes identifiants Supabase
const SUPABASE_URL = "https://mszpafkaytrqcsxcxqxk.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zenBhZmtheXRycWNzeGN4cXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDAzNzYsImV4cCI6MjA3OTExNjM3Nn0.6vhuiOIH9Bw1Obib7tLlxorSrHFP0ngTapP4kbKxKbs";

// Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

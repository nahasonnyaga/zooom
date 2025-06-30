// js/supabase.js
// Initializes and exports the Supabase client for the whole app

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://kocbcrctlneqqxhxowbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // REDACTED: Use your real anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Returns the currently authenticated user, or null
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
window.supabase = supabase;
window.getUser = getUser;

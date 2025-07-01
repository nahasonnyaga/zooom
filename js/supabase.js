// js/supabase.js
// Supabase client for Zooom Forum (Production)
// Project URL & anon key are set below. DO NOT expose service_role keys!
const SUPABASE_URL = 'https://kocbcrctlneqqxhxowbk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY2JjcmN0bG5lcXF4aHhvd2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzc5MjksImV4cCI6MjA2NTk1MzkyOX0.pOL7LyfvmDAQ3IP7qzdpwyHzKaXGCJIN_t3jkx2ZoBI';

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

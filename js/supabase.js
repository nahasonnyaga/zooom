import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Replace with your Supabase project URL and anon key
export const supabase = createClient(
  "https://your-supabase-url.supabase.co",
  "your-anon-key"
);

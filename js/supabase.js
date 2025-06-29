// js/supabase.js
// Initialize Supabase client
// IMPORTANT: Replace these with your actual project credentials!
const SUPABASE_URL = 'https://your-project.supabase.co'; // <-- edit this
const SUPABASE_ANON_KEY = 'your-anon-key'; // <-- edit this

// Ensure Supabase library is loaded
if (typeof window !== 'undefined' && !window.supabase) {
  throw new Error('Supabase client is not loaded. Please include supabase-js via CDN before this script.');
}

// Global supabase client export
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------- Auth Helpers -----------

// Get current user (returns user object or null)
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Sign in with email and password
async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Sign out current user
async function signOut() {
  await supabase.auth.signOut();
}

// Sign up new user
async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password });
}

// ----------- Thread Helpers -----------

// Insert a new thread (content is text)
async function createThread(content) {
  const user = await getUser();
  if (!user) return { data: null, error: 'Not signed in' };
  const { data, error } = await supabase
    .from('threads')
    .insert([{ content, user_id: user.id }]);
  return { data, error };
}

// Fetch all threads, newest first
async function fetchThreads() {
  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      user:users(id, email),        -- fetch user info if RLS allows
      replies(count)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Fetch single thread with replies (and reply authors)
async function fetchThreadWithReplies(threadId) {
  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      user:users(id, email),
      replies(
        *,
        user:users(id, email)
      )
    `)
    .eq('id', threadId)
    .single();
  return { data, error };
}

// Reply to a thread (content is text)
async function replyToThread(threadId, content) {
  const user = await getUser();
  if (!user) return { data: null, error: 'Not signed in' };
  const { data, error } = await supabase
    .from('replies')
    .insert([{ thread_id: threadId, content, user_id: user.id }]);
  return { data, error };
}

// ----------- Utility -----------

// Get user profile by user_id
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

// Export helpers for use in other scripts
window.supabaseApi = {
  supabase,
  getUser,
  signIn,
  signOut,
  signUp,
  createThread,
  fetchThreads,
  fetchThreadWithReplies,
  replyToThread,
  getUserProfile
};

// js/supabase.js
// Initialize Supabase client
const SUPABASE_URL = 'https://your-project.supabase.co'; // <-- edit this
const SUPABASE_ANON_KEY = 'your-anon-key'; // <-- edit this

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Get user session
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: Sign in
async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Helper: Sign out
async function signOut() {
  await supabase.auth.signOut();
}

// Helper: Sign up
async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password });
}

// Helper: Insert new thread
async function createThread(content) {
  const { data, error } = await supabase
    .from('threads')
    .insert([{ content }]);
  return { data, error };
}

// Helper: Fetch threads
async function fetchThreads() {
  let { data, error } = await supabase
    .from('threads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Helper: Fetch single thread and replies
async function fetchThreadWithReplies(threadId) {
  let { data, error } = await supabase
    .from('threads')
    .select('*, replies(*)')
    .eq('id', threadId)
    .single();
  return { data, error };
}

// Helper: Reply to thread
async function replyToThread(threadId, content) {
  const { data, error } = await supabase
    .from('replies')
    .insert([{ thread_id: threadId, content }]);
  return { data, error };
}

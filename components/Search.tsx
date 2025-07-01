import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Universal supabase client, compatible with other project files
// Uses env variables for Next.js and static SPA support
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof window !== "undefined" && (window as any).SUPABASE_URL);
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" && (window as any).SUPABASE_ANON_KEY);
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export default function Search() {
  const [trends, setTrends] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trends on mount
  useEffect(() => {
    supabase
      .from("trends")
      .select("*")
      .order("rank")
      .then(({ data }) => setTrends(data || []));
  }, []);

  // Search posts by topic or content
  useEffect(() => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Search for posts where title or body or topic matches query
    supabase
      .from("posts")
      .select("id, title, body, topic, created_at, user_id")
      .ilike("title", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        setSearchResults(data || []);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-md mx-auto px-2">
      <input
        className="w-full p-2 bg-gray-900 text-white rounded mt-2"
        placeholder="Search topics or posts"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search"
      />
      {query.trim().length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Results for "{query}"</h2>
          {loading && <div className="text-gray-400">Searching...</div>}
          {!loading && searchResults.length === 0 && (
            <div className="text-gray-400">No results found.</div>
          )}
          {searchResults.map(post => (
            <a
              href={`/post/${post.id}`}
              key={post.id}
              className="block bg-gray-800 rounded p-3 mb-2 hover:bg-gray-700 transition"
            >
              <div className="font-semibold">{post.title || post.topic}</div>
              <div className="text-gray-400 text-xs">
                {new Date(post.created_at).toLocaleString()}
              </div>
              <div className="text-gray-300 text-sm truncate">
                {post.body?.slice(0, 80)}
              </div>
            </a>
          ))}
        </div>
      )}

      {query.trim().length === 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Trending</h2>
          {trends.map(trend => (
            <div key={trend.id} className="mb-3">
              <span className="text-gray-400 text-sm">
                {trend.rank} · {trend.category}
              </span>
              <div className="font-semibold">{trend.topic}</div>
              <span className="text-gray-400 text-xs">{trend.post_count} posts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export default function Search() {
  const [trends, setTrends] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("trends").select("*").order("rank")
      .then(({ data }) => setTrends(data || []));
  }, []);

  return (
    <div>
      <input
        className="w-full p-2 bg-gray-900 text-white rounded mt-2"
        placeholder="Search X"
      />
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Trending</h2>
        {trends.map(trend => (
          <div key={trend.id} className="mb-3">
            <span className="text-gray-400 text-sm">{trend.rank} · {trend.category}</span>
            <div className="font-semibold">{trend.topic}</div>
            <span className="text-gray-400 text-xs">{trend.post_count} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdVerified, MdEdit, MdCake, MdCalendarToday } from "react-icons/md";
import { FaEnvelope, FaLink } from "react-icons/fa";
import { Tab } from "@headlessui/react";
import classNames from "classnames";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProfileProps = {
  userId: string;
  sessionUserId?: string;
};

export default function ProfilePage({ userId, sessionUserId }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => setProfile(data));

    supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data || []));

    supabase
      .from("follows")
      .select("id", { count: "exact" })
      .eq("following_id", userId)
      .then(({ count }) => setFollowers(count ?? 0));
    supabase
      .from("follows")
      .select("id", { count: "exact" })
      .eq("follower_id", userId)
      .then(({ count }) => setFollowing(count ?? 0));

    if (sessionUserId) {
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", sessionUserId)
        .eq("following_id", userId)
        .then(({ data }) => setIsFollowing((data || []).length > 0));
    }
  }, [userId, sessionUserId]);

  if (!profile) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-black text-white rounded-lg shadow-lg min-h-screen">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-r from-pink-600 to-purple-700 flex flex-col justify-end p-4">
        <div className="flex space-x-6 mb-4">
          <div>
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white -mb-12"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{profile.display_name}</span>
              {profile.verified && <MdVerified className="text-blue-400" />}
            </div>
            <span className="text-gray-300">@{profile.username}</span>
            {profile.bio && <div className="mt-2 text-sm">{profile.bio}</div>}
          </div>
        </div>
        {/* Music/Celebrity GOSSIP/Reels promo */}
        <div className="flex space-x-6 mt-8">
          <span className="font-bold text-white">MUSIC</span>
          <span className="font-bold text-white

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdVerified, MdEdit, MdCake, MdCalendarToday } from "react-icons/md";
import { FaEnvelope, FaLink } from "react-icons/fa";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProfileProps = {
  userId: string;
  sessionUserId?: string;
};

// Interconnection helper: fetch session for auth
export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

export default function ProfilePage({ userId, sessionUserId }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [tabIdx, setTabIdx] = useState(0);

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

  async function handleFollow() {
    if (!sessionUserId) {
      window.location.href = "/auth.html?tab=login";
      return;
    }
    await supabase.from("follows").insert([
      { follower_id: sessionUserId, following_id: userId }
    ]);
    setIsFollowing(true);
    setFollowers(followers + 1);
  }

  async function handleUnfollow() {
    if (!sessionUserId) return;
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", sessionUserId)
      .eq("following_id", userId);
    setIsFollowing(false);
    setFollowers(followers - 1);
  }

  if (!profile)
    return (
      <div className="text-center text-white py-20">Loading...</div>
    );

  // Interconnection: profile links, follow logic, DM link, etc.
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
              {sessionUserId === userId && (
                <Link href="/profile-edit" className="ml-2">
                  <MdEdit className="inline text-lg" title="Edit Profile" />
                </Link>
              )}
            </div>
            <span className="text-gray-300">@{profile.username}</span>
            {profile.bio && <div className="mt-2 text-sm">{profile.bio}</div>}
          </div>
        </div>
        <div className="flex space-x-6 mt-8">
          <span className="font-bold text-white">MUSIC</span>
          <span className="font-bold text-white">GOSSIP</span>
          <span className="font-bold text-white">REELS</span>
        </div>
      </div>
      {/* Profile details */}
      <div className="px-6 mt-16">
        <div className="flex items-center gap-6">
          <span>
            <b>{followers}</b> Followers
          </span>
          <span>
            <b>{following}</b> Following
          </span>
          {sessionUserId && sessionUserId !== userId && (
            isFollowing ? (
              <button
                className="ml-3 px-4 py-1 rounded bg-gray-700 hover:bg-gray-600"
                onClick={handleUnfollow}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="ml-3 px-4 py-1 rounded bg-blue-600 hover:bg-blue-500"
                onClick={handleFollow}
              >
                Follow
              </button>
            )
          )}
          {sessionUserId && sessionUserId !== userId && (
            <Link
              href={`/messages.html?user=${userId}`}
              className="ml-3 px-4 py-1 rounded bg-green-600 hover:bg-green-500"
            >
              Message
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
          {profile.email && (
            <span><FaEnvelope className="inline mr-1" /> {profile.email}</span>
          )}
          {profile.website && (
            <span>
              <FaLink className="inline mr-1" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </span>
          )}
          {profile.birthdate && (
            <span><MdCake className="inline mr-1" /> {profile.birthdate}</span>
          )}
          {profile.created_at && (
            <span><MdCalendarToday className="inline mr-1" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      {/* Tabs for Posts (and optionally Likes, Replies, etc) */}
      <div className="mt-8 px-2">
        <Tab.Group selectedIndex={tabIdx} onChange={setTabIdx}>
          <Tab.List className="flex space-x-4 border-b border-gray-800 pb-1 mb-3">
            <Tab as="button" className={({ selected }) =>
              classNames("px-3 py-1 rounded-t text-lg focus:outline-none", selected ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-400")
            }>
              Posts
            </Tab>
            {/* Add more tabs if needed */}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div>
                {posts.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">No posts yet.</div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-gray-900 mb-4 p-4 rounded shadow">
                      <div className="text-lg mb-1">{post.title || "(no title)"}</div>
                      <div className="text-sm text-gray-300">{post.body}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

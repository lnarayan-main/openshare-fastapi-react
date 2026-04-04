import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { getMediaUrl } from "../services/helpers";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsAPI.getAllPosts();
        setPosts(response.data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Stats/Intro */}
        <div className="md:flex md:items-center md:justify-between mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              Community Feed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore the latest insights and stories from our members.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              to="/posts/new"
              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Write a Post
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center bg-white rounded-xl py-16 shadow-sm ring-1 ring-gray-900/5">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          /* The Post Grid */
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="group relative flex flex-col items-start">
                {/* Thumbnail Container */}
                <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-inset ring-gray-900/10">
                  <img
                    src={getMediaUrl(post.thumbnail) || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800"}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium backdrop-blur-md bg-white/70 text-gray-800 ring-1 ring-inset ring-gray-900/10`}>
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="max-w-xl">
                  <div className="mt-6 flex items-center gap-x-4 text-xs">
                    <time dateTime={post.created_at} className="text-gray-500">
                      {new Date(post.created_at).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </time>
                    <span className="relative z-10 rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-200">
                      {post.category}
                    </span>
                  </div>
                  
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-indigo-600">
                      <span className="absolute inset-0" />
                      {post.title}
                    </h3>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                      {post.summary || post.content.substring(0, 150) + "..."}
                    </p>
                  </div>

                  {/* Author Footer */}
                  <div className="relative mt-6 flex items-center gap-x-4">
                    <img
                      src={getMediaUrl(post.user?.profile_pic) || "https://via.placeholder.com/40"}
                      alt=""
                      className="h-10 w-10 rounded-full bg-gray-100 object-cover border border-gray-200"
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        {post.user?.full_name || "Anonymous"}
                      </p>
                      <p className="text-gray-600">Contributor</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
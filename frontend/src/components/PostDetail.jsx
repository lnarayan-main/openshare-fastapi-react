import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { postsAPI } from "../services/api";
import { getMediaUrl } from "../services/helpers";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsAPI.getPostById(id);
        setPost(response.data);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
        <Link to="/" className="mt-4 text-indigo-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Article Header / Hero Image */}
      <div className="relative w-full h-[400px] bg-gray-900">
        <img
          src={getMediaUrl(post.thumbnail) || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200"}
          alt={post.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl px-4 text-center">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
          {/* Author Info */}
          <div className="flex items-center gap-x-4">
            <img
              src={getMediaUrl(post.user?.profile_pic) || "/default-avatar.png"}
              alt=""
              className="h-12 w-12 rounded-full bg-gray-50 object-cover"
            />
            <div className="text-sm leading-6">
              <p className="font-semibold text-gray-900">
                {post.user?.full_name}
              </p>
              <p className="text-gray-500">
                Published on {new Date(post.created_at).toLocaleDateString(undefined, { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons (Go back / Share) */}
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600"
            >
              &larr; Back
            </button>
          </div>
        </div>

        {/* Post Content */}
        <article className="prose prose-lg prose-indigo mx-auto text-gray-700 leading-8">
          {/* We use white-space: pre-line to preserve paragraphs from the textarea */}
          <div className="whitespace-pre-line text-lg">
            {post.content}
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            About the author
          </h3>
          <div className="mt-4 flex items-start gap-6 bg-gray-50 p-6 rounded-2xl">
             <img
              src={getMediaUrl(post.user?.profile_pic) || "/default-avatar.png"}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
                <p className="text-base font-bold text-gray-900">{post.user?.full_name}</p>
                <p className="mt-1 text-sm text-gray-600">
                    {post.user?.about_me || "This author hasn't added a bio yet."}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
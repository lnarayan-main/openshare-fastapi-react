import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { getMediaUrl } from "../services/helpers";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsAPI.getPosts();
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
      {/* Container to match Home.jsx: max-w-7xl and mx-auto are key */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="sm:flex sm:items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Posts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your content, track status, and edit your existing blog posts.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <Link
              to="/posts/new"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
            >
              Add post
            </Link>
          </div>
        </div>

        {/* Table Card Section */}
        <div className="mt-8 flow-root bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:pl-6">
                      Post Details
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Author & Category
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      {/* Post Thumbnail & Title */}
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 shrink-0">
                            <img 
                              alt={post.title} 
                              src={getMediaUrl(post.thumbnail) || "https://via.placeholder.com/150"} 
                              className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-900/10" 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">{post.title}</div>
                            <div className="mt-1 text-gray-400 text-xs truncate max-w-[180px]">
                              {post.summary || "No summary provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author & Category */}
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <div className="flex items-center">
                           <img 
                              src={getMediaUrl(post.user?.profile_pic) || "/default-avatar.png"} 
                              className="h-6 w-6 rounded-full mr-2 object-cover" 
                              alt=""
                           />
                           <span className="text-gray-900 font-medium">{post.user?.full_name}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400 ml-8">{post.category || "General"}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          post.status === 'Published' 
                          ? 'bg-green-50 text-green-700 ring-green-600/20' 
                          : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                        }`}>
                          {post.status || 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to={`/posts/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold pr-2">
                          Edit
                        </Link>
                        <Link to={`/posts/${post.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading your posts...</p>
                </div>
              )}
              
              {!loading && posts.length === 0 && (
                <div className="text-center py-20">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
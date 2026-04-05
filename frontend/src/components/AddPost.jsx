import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postsAPI } from '../services/api';

export default function AddPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      category: "General",
      status: "Draft",
      content: "",
    }
  });


  useEffect(() => {
    if (isEditMode) {
      const loadPost = async () => {
        try {
          const response = await postsAPI.getPostById(id);
          reset(response.data); 
        } catch (err) {
          console.error("Failed to load post", err);
        }
      };
      loadPost();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      if (isEditMode) {
        await postsAPI.updatePost(id, data);
      } else {
        await postsAPI.createPost(data);
      }
      navigate("/posts"); 
    } catch (err) {
      setServerError("Failed to create post. Please check your connection.");
      console.error("Create Post Error: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb / Back Navigation */}
        <nav className="mb-8">
          <Link to="/posts" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Back to Posts
          </Link>
        </nav>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-8">
          <div className="border-b border-gray-900/10 pb-8">
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">{isEditMode ? "Update Post" : "Create New Post"}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Fill in the details below to publish a new article to your account.
            </p>
          </div>

          {serverError && (
            <div className="mt-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Post Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="e.g. 10 Tips for FastAPI"
                className={`mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.title ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Post Thumbnail</label>
              <input
                  type="file"
                  id="photo-upload"
                  className=""
                  {...register('photo-upload', {required: "Post thumbnail is required"})}
                  accept="image/*"
                />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Category</label>
                <select
                  {...register("category")}
                  className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="General">General</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Optimization">Optimization</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Initial Status</label>
                <select
                  {...register("status")}
                  className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Post Content</label>
              <textarea
                rows={6}
                {...register("content", { required: "Content cannot be empty" })}
                className={`mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.content ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm`}
                placeholder="Write your story here..."
              />
              {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
              <button
                type="button"
                onClick={() => navigate("/posts")}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
              >
                {isSubmitting ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
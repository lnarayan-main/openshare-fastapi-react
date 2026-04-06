import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postsAPI } from '../services/api';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AddPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [preview, setPreview] = useState(null); // For image preview

  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      category: "General",
      status: "Draft",
      content: "",
    }
  });

  // Watch the file input to update preview
  const photoFile = watch("thumbnail");

  useEffect(() => {
    if (photoFile && photoFile instanceof FileList && photoFile.length > 0) {
      const file = photoFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photoFile]);

  useEffect(() => {
    if (isEditMode) {
      const loadPost = async () => {
        try {
          const response = await postsAPI.getPostById(id);
          reset(response.data);
          if (response.data.thumbnail_url) {
            setPreview(response.data.thumbnail_url);
          }
        } catch (err) {
          console.error("Failed to load post", err);
        }
      };
      loadPost();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    setServerError("");
    
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("status", data.status);
    formData.append("content", data.content);
    
    if (data.thumbnail?.[0]) {
      formData.append("thumbnail", data.thumbnail[0]);
    }

    try {
      if (isEditMode) {
        await postsAPI.updatePost(id, formData);
      } else {
        await postsAPI.createPost(formData);
      }
      navigate("/posts"); 
    } catch (err) {
      setServerError("Failed to save post. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-8">
          <Link to="/posts" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            &larr; Back to Posts
          </Link>
        </nav>

        <div className="bg-white shadow-xl ring-1 ring-gray-200 rounded-2xl p-8">
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? "Update Post" : "Create New Post"}</h2>
            <p className="mt-1 text-sm text-gray-500">Publish your latest insights to the community.</p>
          </div>

          {serverError && (
            <div className="mt-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Post Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="e.g. Master React in 2026"
                className={`mt-1 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.title ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Professional Thumbnail Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Post Thumbnail</label>
              <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
                {preview ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setPreview(null); reset({ ...watch(), thumbnail: null }); }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label htmlFor="thumbnail" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input id="thumbnail" type="file" className="sr-only" accept="image/*" {...register("thumbnail")} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Category</label>
                <select
                  {...register("category")}
                  className="mt-1 block w-full rounded-lg border-0 py-2.5 px-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="General">General</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Optimization">Optimization</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Status</label>
                <select
                  {...register("status")}
                  className="mt-1 block w-full rounded-lg border-0 py-2.5 px-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Post Content</label>
              <textarea
                rows={8}
                {...register("content", { required: "Content cannot be empty" })}
                className={`mt-1 block w-full rounded-lg border-0 py-2.5 px-3 shadow-sm ring-1 ring-inset ${
                  errors.content ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                placeholder="Share your technical expertise..."
              />
              {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/posts")}
                className="text-sm font-bold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-indigo-400"
              >
                {isSubmitting ? "Processing..." : isEditMode ? "Update Post" : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
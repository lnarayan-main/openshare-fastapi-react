import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../services/api";
import { getMediaUrl } from "../services/helpers";


export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      mobile_number: user?.mobile_number || "",
      about_me: user?.about_me || "",
      address: user?.address || "",
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadProfilePic = async () => {
    try {
      const response = await usersAPI.uploadProfilePic(selectedFile);
      console.log('response: ', response);
      setUser(response.data);
      setSelectedFile(null);
    } catch (err) {
      alert("Failed to upload photo");
    }
  };

  const deleteProfilePic = async () => {
    if (window.confirm("Remove profile photo?")) {
      const response = await usersAPI.deleteProfilePic();
      setUser(response.data);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await usersAPI.updateProfile(data);
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          {/* Left Side: Photo Management */}
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Update your photo and personal details.
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative">
                <img
                  src={getMediaUrl(user.profile_pic) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt=""
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              </div>
              <div className="mt-4 flex flex-col gap-2 w-full">
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer text-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Change Photo
                </label>
                {selectedFile && (
                  <button
                    onClick={uploadProfilePic}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                  >
                    Confirm Upload: {selectedFile.name.substring(0, 10)}...
                  </button>
                )}
                {user.profile_pic && (
                  <button
                    onClick={deleteProfilePic}
                    className="text-xs font-medium text-red-600 hover:text-red-500"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Information Form */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                  <input
                    disabled={!isEditing}
                    {...register("full_name", { required: "Name is required" })}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                  <input
                    disabled={!isEditing}
                    {...register("email", { required: true })}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Mobile Number</label>
                  <input
                    disabled={!isEditing}
                    {...register("mobile_number")}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium leading-6 text-gray-900">About Me</label>
                  <textarea
                    disabled={!isEditing}
                    rows={3}
                    {...register("about_me")}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Address</label>
                  <textarea
                    disabled={!isEditing}
                    rows={2}
                    {...register("address")}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset(); // Discard changes
                      }}
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
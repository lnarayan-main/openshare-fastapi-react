import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../services/api";
import PasswordField from "./PasswordField";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");
    try {
      await usersAPI.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setSuccess("Password changed successfully!");
      reset(); // Clear form
      // Optionally redirect after a delay
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setServerError(err.response?.data?.detail || "Failed to change password");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Change Password
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
              {serverError && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                  {serverError}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
                  {success}
                </div>
              )}

              <div className="grid max-w-2xl grid-cols-1 gap-y-6">
                 {/* Current Password */}
                <PasswordField
                  label="Current Password"
                  name="current_password"
                  register={register}
                  error={errors.current_password}
                  validation={{ required: "Current password is required" }}
                />

                {/* New Password */}
                <PasswordField
                  label="New Password"
                  name="new_password"
                  register={register}
                  error={errors.new_password}
                  validation={{
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                />

                {/* Confirm New Password */}
                <PasswordField
                  label="Confirm New Password"
                  name="confirm_password"
                  register={register}
                  error={errors.confirm_password}
                  validation={{
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === watch("new_password") || "Passwords do not match",
                  }}
                />
              </div>

              <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
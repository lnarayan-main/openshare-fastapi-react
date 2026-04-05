import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  // Watch the password field to compare it with 'confirmPassword'
  const password = watch("password", "");

  const onSubmit = async (data) => {
    setError("");
    try {
      const response = await authAPI.resetPassword(token, { new_password: data.password });
      console.log("Response: ", response);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : detail || "Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please choose a strong password you haven't used before.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Password Updated!</h3>
            <p className="mt-2 text-sm text-gray-600">Your password has been changed. Redirecting you to login...</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
              Click here if not redirected
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900">New Password</label>
              <input
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Must be at least 8 characters" }
                })}
                type="password"
                placeholder="New password"
                className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 px-2"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900">Confirm New Password</label>
              <input
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                type="password"
                placeholder="Confirm password"
                className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 px-2"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
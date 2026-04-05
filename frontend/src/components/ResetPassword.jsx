import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api";
import Logo from "./Logo";

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
      // KEEPING YOUR LOGIC: Sending { new_password: ... }
      const response = await authAPI.resetPassword(token, { new_password: data.password });
      console.log("Response: ", response);
      setIsSuccess(true);
      
      // KEEPING YOUR LOGIC: 3s Redirect
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0].msg : detail || "Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-6 py-12">
      
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl ring-1 ring-gray-200">
        
        <div className="sm:mx-auto sm:w-full">
          <Logo/>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Secure Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Please enter and confirm your new password below.
          </p>
        </div>

        <div className="mt-10">
          {isSuccess ? (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6 shadow-inner">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Success!</h3>
              <p className="mt-3 text-sm text-gray-600">
                Your password has been updated.
              </p>
              <p className="mt-1 text-xs text-indigo-500 font-medium italic">
                Redirecting to login in 3 seconds...
              </p>
              <div className="mt-8 border-t border-gray-100 pt-6">
                <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                  Click here to login now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">New Password</label>
                <div className="mt-1">
                  <input
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Must be at least 8 characters" }
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.password ? 'ring-red-500' : 'ring-gray-300'
                    } focus:ring-2 focus:ring-indigo-600 transition-all sm:text-sm`}
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="mt-1">
                  <input
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match"
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.confirmPassword ? 'ring-red-500' : 'ring-gray-300'
                    } focus:ring-2 focus:ring-indigo-600 transition-all sm:text-sm`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="text-sm text-red-700 font-medium text-center">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:bg-indigo-400"
                >
                  {isSubmitting ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
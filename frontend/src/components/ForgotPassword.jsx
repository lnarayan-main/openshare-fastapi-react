import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api"; 
import Logo from "./Logo";

export default function ForgotPassword() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [error, setError] = useState("");
  
  const appName = import.meta.env.VITE_APP_NAME || "OpenShare Platform";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      // KEEPING YOUR LOGIC: Passing only data.email
      const response = await authAPI.forgotPassword(data.email);
      // KEEPING YOUR LOGIC: Accessing response.data?.message
      setResMessage(response.data?.message);
      setIsEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-6 py-12">
      
      {/* Enhanced Card UI */}
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl ring-1 ring-gray-200">
        
        <div className="sm:mx-auto sm:w-full">
          <Logo/>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Instructions will be sent to your email.
          </p>
        </div>

        <div className="mt-10">
          {!isEmailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Entered value does not match email format",
                      },
                    })}
                    type="email"
                    placeholder="Email address (e.g. mail@company.com)"
                    className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                      errors.email ? "ring-red-500" : "ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all sm:text-sm`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                  <p className="text-sm text-red-700 text-center font-medium">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:bg-indigo-400"
                >
                  {isSubmitting ? "Sending..." : "Reset Password"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
              <p className="mt-3 text-sm text-gray-600 px-4">
                {resMessage}
              </p>
              <div className="mt-8 border-t border-gray-100 pt-6">
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-500"
                >
                  Didn't receive it? <span className="underline">Try again</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              Remembered your password?{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
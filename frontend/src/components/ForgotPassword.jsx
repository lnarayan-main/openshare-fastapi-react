import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api"; 

export default function ForgotPassword() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resMessage, setResMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      const response = await authAPI.forgotPassword(data.email);
      setResMessage(response.data?.message);
      setIsEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        {!isEmailSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Entered value does not match email format",
                    },
                  })}
                  type="email"
                  placeholder="name@company.com"
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset px-2 ${
                    errors.email ? "ring-red-500" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
              >
                {isSubmitting ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Check your email</h3>
            <p className="mt-2 text-sm text-gray-600">
              {resMessage}
            </p>
            <button
              onClick={() => setIsEmailSent(false)}
              className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Didn't receive it? Try again
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
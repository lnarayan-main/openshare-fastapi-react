import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // Pass email and password from the form to your AuthContext login
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      // Catch 401 or 422 errors from the backend
      setServerError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="CRUD App Logo"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Server-side Error Alert */}
        {serverError && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                    message: "Please enter a valid email address"
                  }
                })}
                placeholder='Email'
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 ${
                  errors.email ? 'outline-red-500' : 'outline-gray-300'
                } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                placeholder='Password'
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 ${
                  errors.password ? 'outline-red-500' : 'outline-gray-300'
                } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Not a member?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
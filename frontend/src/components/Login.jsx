import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import PasswordField from './PasswordField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  
  // Dynamic App Name from .env
  const appName = import.meta.env.VITE_APP_NAME || "OpenShare Platform";

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
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      setServerError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    // Modern Background: A subtle gradient to break the "flat" look
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-6 py-12">
      
      {/* Main Login Card - Increased width to md (28rem) and added white background */}
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl ring-1 ring-gray-200">
        
        <div className="sm:mx-auto sm:w-full">
          {/* Dynamic Logo Section */}
          <Logo/>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Login to your <span className="font-semibold text-indigo-600">{appName}</span>
          </p>
        </div>

        <div className="mt-10">
          {serverError && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center animate-pulse">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  placeholder='you@example.com'
                  className={`px-3 block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.email ? 'ring-red-500' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <PasswordField 
              label="Password"
              name="password"
              register={register}
              error={errors.password}
              validation={{ required: "Password is required" }}
            />

            <div className="flex justify-end -mt-4">
              <Link to="/forgot-password" intrinsic="true" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-[0.98] disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              New to {appName}?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
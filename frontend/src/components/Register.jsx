import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register: authRegister } = useAuth(); // Rename to avoid conflict with useForm's register
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      mobile_number: "",
      password: "",
      confirmPassword: "",
    }
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authRegister({
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        mobile_number: data.mobile_number,
        about_me: `Hello! I am ${data.full_name}.`,
        address: "Update your address",
      });
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.detail || "Registration failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {serverError && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">Full Name</label>
            <input
              {...register("full_name", { required: "Full name is required" })}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.full_name ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6`}
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">Email address</label>
            <input
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: "Invalid email format" }
              })}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-indigo-600 sm:text-sm/6`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">Mobile Number (Optional)</label>
            <input
              {...register("mobile_number")}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">Password</label>
            <input
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" }
              })}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.password ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-indigo-600 sm:text-sm/6`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => {
                  if (watch('password') !== val) {
                    return "Your passwords do not match";
                  }
                },
              })}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${errors.confirmPassword ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-indigo-600 sm:text-sm/6`}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
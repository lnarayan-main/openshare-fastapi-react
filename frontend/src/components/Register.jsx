import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import PasswordField from './PasswordField';

export default function Register() {
  const { register: authRegister } = useAuth(); 
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  
  const appName = import.meta.env.VITE_APP_NAME || "OpenShare Platform";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-6 py-12">
      
      {/* Registration Card - Increased to max-w-lg for better spacing of multiple fields */}
      <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-xl ring-1 ring-gray-200">
        
        <div className="sm:mx-auto sm:w-full">
          <Logo/>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Join the <span className="font-semibold text-indigo-600">{appName}</span> community
          </p>
        </div>

        <div className="mt-8">
          {serverError && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <input
                {...register("full_name", { required: "Full name is required" })}
                placeholder='Full name'
                className={`mt-1 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.full_name ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            {/* Email & Mobile Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: "Invalid email" }
                  })}
                  placeholder='mail@example.com'
                  className={`mt-1 block w-full rounded-lg border-0 py-2.5 px-3 shadow-sm ring-1 ring-inset ${
                    errors.email ? 'ring-red-500' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-indigo-600 sm:text-sm`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Mobile (Optional)</label>
                <input
                  {...register("mobile_number")}
                  placeholder='Mobile number'
                  className="mt-1 block w-full rounded-lg border-0 py-2.5 px-3 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PasswordField 
                label="Password"
                name="password"
                register={register}
                error={errors.password}
                validation={{ 
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 chars" },
                  maxLength: { value: 32, message: "Max 32 chars" }
                }}
              />

              <PasswordField 
                label="Confirm"
                name="confirmPassword"
                register={register}
                error={errors.confirmPassword}
                validation={{
                  required: "Please confirm",
                  validate: (val) => watch('password') === val || "No match",
                }}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:bg-indigo-400"
              >
                {isSubmitting ? "Creating account..." : "Get Started"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
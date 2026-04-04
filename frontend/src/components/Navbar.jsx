import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const appName = import.meta.env.VITE_APP_NAME || "My Platform";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-indigo-600">{appName}</Link>
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link to="/posts" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Posts</Link>
                <Link to="/posts/new" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Add Post</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm text-gray-700 font-medium hover:text-indigo-600">
                  Hi, {user.full_name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-900">Log in</Link>
                <Link to="/register" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
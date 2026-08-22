import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  ShieldCheckIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

const appName = import.meta.env.VITE_APP_NAME || "My Platform";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine user's first name for greeting
  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo + Public/Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              {appName}
            </Link>

            {/* Role‑based links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <HomeIcon className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/posts"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Posts
                    </Link>
                    <Link
                      to="/posts/new"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Add Post
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: User Dropdown or Auth buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {firstName}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 py-1 z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/change-password" // you can create this route or link to /profile with password section
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
                        Change Password
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
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
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)] p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/admin" className="block px-4 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-medium">
                  🏠 Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/documents" className="block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700">
                  📄 Documents
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700">
                  👥 Users
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className="block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700">
                  ⚙️ Settings
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
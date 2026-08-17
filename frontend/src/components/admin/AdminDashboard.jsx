import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.full_name || 'Admin'}!</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Documents</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">42</p>
          <Link to="/admin/documents" className="text-sm text-indigo-600 hover:underline">Manage →</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Users</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">15</p>
          <Link to="/admin/users" className="text-sm text-indigo-600 hover:underline">Manage →</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Chat Sessions</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">128</p>
          <Link to="/admin/chats" className="text-sm text-indigo-600 hover:underline">View →</Link>
        </div>
      </div>

      {/* Quick action links */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/documents/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            + Add Document
          </Link>
          <Link to="/admin/documents" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            View All Documents
          </Link>
        </div>
      </div>
    </div>
  );
}
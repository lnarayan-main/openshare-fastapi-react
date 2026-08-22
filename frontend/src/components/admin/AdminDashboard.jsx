import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Could not load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Define card data for mapping
  const cardData = [
    {
      title: 'Total Users',
      count: stats?.users ?? 0,
      icon: UsersIcon,
      color: 'blue',
      link: '/admin/users',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Documents',
      count: stats?.documents ?? 0,
      icon: DocumentTextIcon,
      color: 'indigo',
      link: '/admin/documents',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Chat Messages',
      count: stats?.chats ?? 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'green',
      link: '/admin/chats', // placeholder - you can create this later
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Chat Users',
      count: stats?.chat_users ?? 0,
      icon: UserGroupIcon,
      color: 'purple',
      link: '/admin/users',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-200 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold">{user?.full_name || 'Admin'}</span>! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid - Clickable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.count}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions Row (Optional) */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/documents/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Document
          </Link>
          <Link
            to="/admin/users/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add User
          </Link>
          <Link
            to="/admin/documents"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  );
}
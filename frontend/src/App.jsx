import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Register from "./components/Register";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import PostsList from "./components/PostsList";
import AddPost from "./components/AddPost";
import Layout from "./components/Layout";
import PostDetail from "./components/PostDetail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ChangePassword from "./components/ChangePassword";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import DocumentList from "./components/admin/DocumentList";
import DocumentForm from "./components/admin/DocumentForm";
import UserList from "./components/admin/UserList";
import UserForm from "./components/admin/UserForm";


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Add a new PrivateRoute variant for admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages (No Header) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/posts/:id" element={<PostDetail />} />

          {/* Private Pages (With Common Header) */}
          {/* <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} /> */}
          <Route path="/posts" element={<PrivateRoute><Layout><PostsList /></Layout></PrivateRoute>} />
          <Route path="/posts/new" element={<PrivateRoute><Layout><AddPost /></Layout></PrivateRoute>} />
          <Route path="/posts/edit/:id" element={<PrivateRoute><Layout><AddPost /></Layout></PrivateRoute>} />
          {/* <Route path="/posts/:id" element={<PrivateRoute><Layout><PostDetail /></Layout></PrivateRoute>} /> */}
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><Layout><ChangePassword /></Layout></PrivateRoute>}/>
          
          <Route path="*" element={<Navigate to="/" />} />

          {/* Admin Routes  */}
          <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/documents" element={<AdminRoute><AdminLayout><DocumentList /></AdminLayout></AdminRoute>} />
          <Route path="/admin/documents/new" element={<AdminRoute><AdminLayout><DocumentForm /></AdminLayout></AdminRoute>} />
          <Route path="/admin/documents/edit/:id" element={<AdminRoute><AdminLayout><DocumentForm /></AdminLayout></AdminRoute>} />

          {/* Users  */}
          <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserList /></AdminLayout></AdminRoute>} />
          <Route path="/admin/users/new" element={<AdminRoute><AdminLayout><UserForm /></AdminLayout></AdminRoute>} />
          <Route path="/admin/users/edit/:id" element={<AdminRoute><AdminLayout><UserForm /></AdminLayout></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


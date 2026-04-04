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


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages (No Header) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Pages (With Common Header) */}
          <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
          <Route path="/posts" element={<PrivateRoute><Layout><PostsList /></Layout></PrivateRoute>} />
          <Route path="/posts/new" element={<PrivateRoute><Layout><AddPost /></Layout></PrivateRoute>} />
          <Route path="/posts/:id" element={<PrivateRoute><Layout><PostDetail /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


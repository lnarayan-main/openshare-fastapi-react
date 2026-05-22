import Navbar from "./Navbar";
import ChatWidget from "./ChatWidget";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {children}
      </main>
      {user && <ChatWidget />}
    </div>
  );
}
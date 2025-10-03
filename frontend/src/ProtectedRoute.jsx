import { Navigate } from "react-router";
import { useAuth } from "./contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/" replace />;
}
import { Navigate } from "react-router";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import {useContext} from "react";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <p>Loading...</p>;
    return user ? children : <Navigate to="/" />;
}
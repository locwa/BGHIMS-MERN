import ProtectedRoute from "../ProtectedRoute.jsx"
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
    const { logout } = useAuth()
    return (
        <ProtectedRoute>
            <h1>Dashboard (Protected)</h1>
            <button onClick={logout}>Logout</button>
        </ProtectedRoute>
    );
}

import { useAuth } from "../contexts/AuthContext.jsx";
import {Navigate, useNavigate} from "react-router";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = () => {
        login("Louis"); // fake login
        navigate("/dashboard");
    };

    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
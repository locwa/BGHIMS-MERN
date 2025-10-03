import { useAuth } from "../contexts/AuthContext.jsx";
import {Navigate, useNavigate} from "react-router";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = () => {
        login("User"); // fake login
        navigate("/home");
    };

    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
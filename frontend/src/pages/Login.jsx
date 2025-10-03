import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

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
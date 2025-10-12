import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios'

export const AuthContext = createContext();

const BASE_URL = 'http://localhost:3000/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState(null); // new state

    useEffect(() => {
        axios.get(`${BASE_URL}/profile`, { withCredentials: true })
            .then(res => setUser(res.data.user))
            .catch(() => {
                setUser(null)
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/login`,
                { email, password },
                { withCredentials: true }
            );
            setUser(res.data.user);
            setLoginError(null);
        } catch (err) {
            setLoginError("Invalid Username or Password");
            window.alert("Invalid Username or Password");
        }
    };

    const logout = async () => {
        await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
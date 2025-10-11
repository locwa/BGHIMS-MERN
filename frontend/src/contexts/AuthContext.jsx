import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios'

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState({});
    const BASE_URL = "http://localhost:3000"

    const login = async (email, password) => {
        // const newUser = { name: username };
        // setUser(newUser);
        return await axios.post(`${BASE_URL}/login`, {
            username: email,
            password: password
        })
            .then(res => {
                setUser(res)
                console.log(user)
            })
            .catch(err => {
                window.alert(`Wrong input + ${err}`)
            })
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
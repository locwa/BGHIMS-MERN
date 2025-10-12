import {AuthContext} from "../contexts/AuthContext.jsx";
import {useNavigate} from "react-router";
import {useState, useEffect, useContext} from "react";

export default function Login() {
    const { user, loading, login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/home');
        }
    }, [loading, user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        await login(email, password);
        navigate('/home');
    };

    return (
        <div className="flex">
            <div className="m-auto flex flex-col align-items-center justify-content-center p-5 bg-gray-200 rounded-2xl w-96">
                <h1 className="text-center text-3xl font-bold">Login Page</h1>

                <div className="my-2 ">
                    <label htmlFor="email">Email:</label><br/>
                    <input type="email" name="email" placeholder="e.g., jdoe@email.com"
                           className="bg-gray-300 w-full p-1 mb-3" onChange={(e) => {
                        setEmail(e.target.value)
                    }}/>

                    <label htmlFor="password">Email:</label><br/>
                    <input type="password" name="password" placeholder="Password"
                           className="bg-gray-300 w-full p-1 mb-3" onChange={(e) => {
                        setPassword(e.target.value)
                    }}/>
                </div>

                <button className="bg-black text-white p-2" onClick={handleLogin}>Login</button>
            </div>

        </div>
    );
}
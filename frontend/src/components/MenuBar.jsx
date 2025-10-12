import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {NavLink, useNavigate} from "react-router";
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";

export default function MenuBar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    library.add(fas)
    return (
        <div className="w-[22vw] h-[100vh] bg-[#2c3e50] text-white sticky top-0 h-screen">
            <h2 className="text-3xl text-center py-6 font-semibold">Dashboard</h2>
            <hr/>
            <ul className="py-6 px-4">
                <li className="py-3"><NavLink to="/home" className="w-[100%] text-left flex items-center"><FontAwesomeIcon icon={["fas", "home"]}  className="pr-3"/>Overview</NavLink></li>
                <li className="py-3"><NavLink to="/inventory" className="w-[100%] text-left flex items-center"><FontAwesomeIcon icon={["fas", "boxes"]}  className="pr-3"/> Inventory</NavLink></li>
                <li className="py-3"><NavLink to="/add-or-remove" className="w-[100%] text-left flex items-center"><FontAwesomeIcon icon={["fas", "exchange-alt"]}  className="pr-3"/>Add/Edit Particulars</NavLink></li>
                <li className="py-3"><NavLink to="/generate-report" className="w-[100%] text-left flex items-center"><FontAwesomeIcon icon={["fas", "file-alt"]}  className="pr-3"/> Report</NavLink></li>
                <li className="py-3"><button onClick={handleLogout} className="w-[100%] text-left hover:cursor-pointer flex items-center" ><FontAwesomeIcon icon={["fas", "sign-out-alt"]}  className="pr-3"/> Logout</button></li>
            </ul>
        </div>
    )
}
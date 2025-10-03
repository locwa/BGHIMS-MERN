import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useAuth} from "../contexts/AuthContext.jsx";

export default function MenuBar() {
    library.add(fas)
    const { logout, user } = useAuth()
    return (
        <div className="w-[22vw] h-[100vh] bg-[#2c3e50] text-white">
            <h2 className="text-3xl text-center py-6 font-semibold">Dashboard</h2>
            <hr/>
            <ul className="py-6 px-4">
                <li className="py-3"><a href="#"><FontAwesomeIcon icon={["fas", "home"]}  className="pr-3"/>Overview</a></li>
                <li className="py-3"><a href="inventory.php"><FontAwesomeIcon icon={["fas", "boxes"]}  className="pr-3"/> Inventory</a></li>
                <li className="py-3"><a href="add-or-remove.php"><FontAwesomeIcon icon={["fas", "exchange-alt"]}  className="pr-3"/>Add/Remove Stock</a></li>
                <li className="py-3"><a href="generate-report.php"><FontAwesomeIcon icon={["fas", "file-alt"]}  className="pr-3"/> Report</a></li>
                <li className="py-3"><button className="w-[100%] text-left" onClick={logout}><FontAwesomeIcon icon={["fas", "sign-out-alt"]}  className="pr-3"/> Logout</button></li>
            </ul>
        </div>
    )
}
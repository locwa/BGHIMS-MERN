import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";

export default function AddOrEditParticulars() {
    const { user, logout } = useContext(AuthContext);
    console.log(user)
    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Add or Edit Particulars</h1>

        </DashboardTemplate>
    );
}

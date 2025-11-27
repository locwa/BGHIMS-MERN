import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {AuthContext} from "../contexts/AuthContext";

export default function ChangePassword() {
    const { user } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")

    const BASE_URL = "http://localhost:3000";

    const updatePassword = async () => {
        let data = {
            password: newPassword,
        };

        try {
            const res = await fetch(`${BASE_URL}/accounts/update-password/${user.Id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert("Update Password failed: " + result.error);
                return;
            }

            return result;
        } catch (e) {
            console.log("Update password error:", e);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (newPassword === confirmNewPassword) {
            updatePassword()
            alert("Password Changed")
            window.location.reload();
        } else {
            alert("Inputs do not match")
            window.location.reload();
        }
    }

    return (
        <DashboardTemplate>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Change Password</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Change Password
                </button>
            </form>
        </DashboardTemplate>
    );
}
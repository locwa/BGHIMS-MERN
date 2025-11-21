import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";
import axios from 'axios'

export default function AccountManagement() {
    const {user, logout} = useContext(AuthContext);
    const [accounts, setAccounts] = useState([])

    const BASE_URL = "http://localhost:3000";

    const getAccounts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/accounts`);
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
            throw err;
        }
    };

    useEffect(() => {
        getAccounts()
            .then((data) => {
                setAccounts(data);
                console.log(data)
            })
            .catch((e) => {
                alert("Failed to load accounts " + e);

            })
    }, []);


    return (
        <DashboardTemplate>
            {/* Header with Notification Bell */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Management</h1>
                    <p className="text-gray-600">Accounts currently active in the system</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Id
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Account Type
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {accounts.map((item) => (
                                <tr className="hover:bg-gray-50 transition text-center">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.Id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.Name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.JobTitle}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.Role}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardTemplate>
    )
}

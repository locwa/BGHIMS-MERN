import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";
import axios from 'axios'

function Modal({ children, onClose, title }) {
    return (
        <div
            className="w-screen h-screen fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4"
            style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
        >
            <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AccountManagement() {
    const {user, logout} = useContext(AuthContext);
    const [accounts, setAccounts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("")

    const [employeeId, setEmployeeId] = useState(0)
    const [employeeName, setEmployeeName] = useState("")
    const [employeeEmail, setEmployeeEmail] = useState("")
    const [employeePassword, setEmployeePassword] = useState("")
    const [employeeRole, setEmployeeRole] = useState("")
    const [employeeTitle, setEmployeeTitle] = useState("")

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

    const openEditAccountModal = (item) => {
        setIsModalOpen(true)
        setModalTitle("Edit Account")
        setEmployeeId(item.Id)
        setEmployeeName(item.Name)
        setEmployeeEmail(item.Email)
        setEmployeePassword(item.Password)
        setEmployeeRole(item.Role)
        setEmployeeTitle(item.JobTitle)
    }

    const openAddNewItem = () => {
        setIsModalOpen(true)
        setModalTitle("Create Account")
        setEmployeeId("")
        setEmployeeName("")
        setEmployeeEmail("")
        setEmployeePassword("")
        setEmployeeRole("")
        setEmployeeTitle("")
    }

    const updateItem = async () => {
        let data = {
            Id: employeeId,
            Name: employeeName,
            Email: employeeEmail,
            Password: employeePassword,
            Role: employeeRole,
            JobTitle: employeeTitle
        };

        try {
            const res = await fetch(`${BASE_URL}/accounts/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert("Update failed: " + result.error);
                return;
            }

            return result;
        } catch (e) {
            console.log("Fetch error:", e);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalTitle.includes("Edit")) {
            updateItem(employeeId);
            window.location.reload();
        } else {
            addAccount();
            window.location.reload();
        }
    };

    const deleteAccount = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/accounts/delete/${id}`, {
                method: "POST",
            });

            const result = await res.json();

            if (!res.ok) {
                alert("Update failed: " + result.error);
                return;
            }

            // Refresh the table without reloading the whole app
            const updated = await getAccounts();
            setAccounts(updated);

        } catch (e) {
            console.log("Fetch error:", e);
        }
    };

    const addAccount = async() => {
        let data = {
            Id: employeeId,
            Name: employeeName,
            Email: employeeEmail,
            Password: employeePassword,
            Role: employeeRole,
            JobTitle: employeeTitle
        };

        try {
            const res = await fetch(`${BASE_URL}/accounts/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert("Update failed: " + result.error);
                return;
            }

            return result;
        } catch (e) {
            console.log("Fetch error:", e);
        }
        window.location.reload()
    }


    return (
        <DashboardTemplate>
            {/* Header with Notification Bell */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Management</h1>
                    <p className="text-gray-600">Accounts currently active in the system</p>
                </div>
            </div>
            <button
                onClick={openAddNewItem}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 mb-3"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add New Account
            </button>
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
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => openEditAccountModal(item)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                                                title="Add more stock"
                                            >
                                                Edit Account
                                            </button>
                                            <button
                                                onClick={() => deleteAccount(item.Id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                                                title="Add more stock"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <Modal title={modalTitle} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                placeholder="e.g., Juan Dela Cruz"
                                className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={employeeEmail}
                                onChange={(e) => setEmployeeEmail(e.target.value)}
                                placeholder="e.g., jdc@mail.com"
                                className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={employeePassword}
                                onChange={(e) => setEmployeePassword(e.target.value)}
                                className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={employeeRole}
                                onChange={(e) => setEmployeeRole(e.target.value)}
                                placeholder="e.g., Admin"
                                className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={employeeTitle}
                                onChange={(e) => setEmployeeTitle(e.target.value)}
                                placeholder="e.g., Medical Technologist"
                                className={'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-sm"
                        >
                            {modalTitle}
                        </button>
                    </form>
                </Modal>
            )}
        </DashboardTemplate>
    )
}

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

    return (
        <div className="w-64 h-screen bg-gradient-to-b from-[#8CCB8C] to-[#7AB87A] text-white sticky top-0 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-green-400">
                <div className="flex items-center justify-center mb-3">
                    <div className="bg-white rounded-full p-2">
                        <img 
                            src="/bgh_logo.png" 
                            alt="BGH Logo" 
                            className="w-25 h-25 object-contain"
                        />
                    </div>
                </div>
                <h2 className="text-2xl text-center font-bold">Bontoc General Hospital</h2>
                <p className="text-green-50 text-center text-sm mt-1">Inventory System</p>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 bg-green-700 bg-opacity-40">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-lg">
                        {user?.Name?.charAt(0) || user?.Email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.Name || 'User'}</p>
                        <p className="text-xs text-green-50 truncate">{user?.Role || 'Staff'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    <li>
                        <NavLink 
                            to="/home"
                            className={({isActive}) => 
                                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-green-600 text-white shadow-lg' 
                                        : 'text-white hover:bg-green-600 hover:bg-opacity-50'
                                }`
                            }
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <span className="font-medium">Overview</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink 
                            to="/inventory"
                            className={({isActive}) => 
                                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-green-600 text-white shadow-lg' 
                                        : 'text-white hover:bg-green-600 hover:bg-opacity-50'
                                }`
                            }
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            <span className="font-medium">Inventory</span>
                        </NavLink>
                    </li>

                    {user.Role === "Admin" && (
                        <li>
                            <NavLink 
                                to="/add-or-remove"
                                className={({isActive}) => 
                                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-green-600 text-white shadow-lg' 
                                            : 'text-white hover:bg-green-600 hover:bg-opacity-50'
                                    }`
                                }
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                <span className="font-medium">Add/Edit Items</span>
                            </NavLink>
                        </li>
                    )}

                    {user.Role === "Staff" && (
                        <li>
                            <NavLink 
                                to="/item-request"
                                className={({isActive}) => 
                                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-green-600 text-white shadow-lg' 
                                            : 'text-white hover:bg-green-600 hover:bg-opacity-50'
                                    }`
                                }
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span className="font-medium">Item Request</span>
                        </NavLink>
                    </li>
                    )}

                    {user.Role === "Admin" && (
                        <li>
                            <NavLink 
                                to="/generate-report"
                                className={({isActive}) => 
                                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-green-600 text-white shadow-lg' 
                                            : 'text-white hover:bg-green-600 hover:bg-opacity-50'
                                    }`
                                }
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="font-medium">Reports</span>
                        </NavLink>
                        </li>
                    )}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-green-400">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 text-white font-medium shadow-lg"
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
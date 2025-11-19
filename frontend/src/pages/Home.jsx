import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import axios from "axios";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";

// Simple CSS Bar Chart Component
function SimpleBarChart({ data, title }) {
    const maxValue = Math.max(...Object.values(data));
    
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{title}</h3>
            <div className="space-y-4">
                {Object.entries(data).map(([category, count], index) => {
                    const percentage = (count / maxValue) * 100;
                    const colors = [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-orange-500',
                        'bg-pink-500',
                        'bg-indigo-500',
                        'bg-teal-500',
                        'bg-red-500',
                        'bg-yellow-500',
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                        <div key={category} className="flex items-center gap-4">
                            <div className="w-32 text-sm font-medium text-gray-700 capitalize truncate" title={category}>
                                {category}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                                <div
                                    className={`${color} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                                    style={{ width: `${percentage}%`, minWidth: count > 0 ? '40px' : '0' }}
                                >
                                    <span className="text-white font-bold text-sm">{count}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Confirmation Modal Component
function ConfirmationModal({ notification, onConfirm, onCancel }) {
    if (!notification) return null;
    
    return (
        <div 
            className="w-screen h-screen fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">Confirm Removal</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-4">
                        Are you sure you want to remove this notification?
                    </p>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">
                            {notification.ParticularName || notification.Name}
                        </p>
                        {notification.BatchNumber && (
                            <p className="text-xs text-gray-600 mt-1">
                                Batch: {notification.BatchNumber}
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// Notification Bell Component
function NotificationBell({ notifications, onToggle, isOpen, onRemove, onViewDetails }) {
    const totalNotifications = notifications.expiring.length + notifications.expired.length + notifications.outOfStock.length;
    
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="relative p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {totalNotifications > 99 ? '99+' : totalNotifications}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                        <p className="text-xs text-gray-600">{totalNotifications} total alerts</p>
                    </div>
                    
                    {totalNotifications === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p className="text-gray-500 font-medium">No notifications</p>
                            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {/* Out of Stock Notifications */}
                            {notifications.outOfStock.length > 0 && (
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        <h4 className="font-semibold text-red-800 text-sm">Out of Stock ({notifications.outOfStock.length})</h4>
                                    </div>
                                    {notifications.outOfStock.map((item, idx) => (
                                        <div key={idx} className="ml-4 py-2 text-sm text-gray-700 border-l-2 border-red-300 pl-3 mb-1 flex items-center justify-between group">
                                            <span>{item.ParticularName} - Batch: {item.BatchNumber}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onViewDetails(item)}
                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                    title="View details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => onRemove(item, 'outOfStock')}
                                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                                    title="Remove notification"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Expired Notifications */}
                            {notifications.expired.length > 0 && (
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                        <h4 className="font-semibold text-purple-800 text-sm">Expired ({notifications.expired.length})</h4>
                                    </div>
                                    {notifications.expired.map((item, idx) => (
                                        <div key={idx} className="ml-4 py-2 text-sm text-gray-700 border-l-2 border-purple-300 pl-3 mb-1 group">
                                            <div className="flex items-center justify-between">
                                                <span>{item.ParticularName} - Batch: {item.BatchNumber}</span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onViewDetails(item)}
                                                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                        title="View details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onRemove(item, 'expired')}
                                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                                        title="Remove notification"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Expiring Soon Notifications */}
                            {notifications.expiring.length > 0 && (
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <h4 className="font-semibold text-orange-800 text-sm">Expiring Soon ({notifications.expiring.length})</h4>
                                    </div>
                                    {notifications.expiring.map((item, idx) => (
                                        <div key={idx} className="ml-4 py-2 text-sm text-gray-700 border-l-2 border-orange-300 pl-3 mb-1 group">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {item.ParticularName} - Batch: {item.BatchNumber}
                                                    <span className="text-xs text-orange-600 ml-2">
                                                        ({Math.ceil((new Date(item.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days)
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onViewDetails(item)}
                                                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                        title="View details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onRemove(item, 'expiring')}
                                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                                        title="Remove notification"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Modal Component for Item Details
function ItemDetailsModal({ item, onClose }) {
    if (!item) return null;
    
    return (
        <div 
            className="w-screen h-screen fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4"
            style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
        >
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Item Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Item Name</label>
                            <p className="text-gray-900 mt-1">{item.ParticularName || item.Name}</p>
                        </div>
                        {item.BatchNumber && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Batch Number</label>
                                <p className="text-gray-900 mt-1">{item.BatchNumber}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Quantity</label>
                            <p className="text-gray-900 mt-1 text-2xl font-bold text-blue-600">
                                {item.RemainingQuantity || item.Qty || item.TotalQty || 0}
                            </p>
                        </div>
                        {item.Unit && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Unit</label>
                                <p className="text-gray-900 mt-1">{item.Unit}</p>
                            </div>
                        )}
                        {item.ExpiryDate && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(item.ExpiryDate).toLocaleDateString("en-CA")}
                                </p>
                            </div>
                        )}
                        {item.Category && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <p className="text-gray-900 mt-1">{item.Category}</p>
                            </div>
                        )}
                    </div>

                    {/* Batches Table if available */}
                    {item.batches && item.batches.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Batch Details</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Batch Number</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Quantity</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Unit</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Expiry Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {item.batches.map((batch, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-900">{batch.BatchNumber || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm text-center font-semibold text-gray-900">{batch.Qty}</td>
                                                <td className="px-4 py-2 text-sm text-center text-gray-700">{batch.Unit || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm text-center text-gray-700">
                                                    {batch.ExpiryDate 
                                                        ? new Date(batch.ExpiryDate).toLocaleDateString("en-CA")
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => window.location.href = '/inventory'}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Inventory
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [inventory, setInventory] = useState([]);
    const [allInventory, setAllInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    const [availableYears, setAvailableYears] = useState([]);
    const [deletingNotification, setDeletingNotification] = useState(null);
    const [dismissedNotifications, setDismissedNotifications] = useState([]);
    const navigate = useNavigate();

    const BASE_URL = 'http://localhost:3000';

    const lowStockItems = async() => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory/lowItems`, {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch items:", err);
            throw err;
        }
    }

    const getAllInventory = async() => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch all inventory:", err);
            throw err;
        }
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([lowStockItems(), getAllInventory()])
            .then(([lowStockData, allData]) => {
                setInventory(lowStockData);
                setAllInventory(allData);
                setFilteredInventory(allData);
                
                // Extract unique years
                const years = [...new Set(allData.map(item => item.Year).filter(year => year))];
                setAvailableYears(years.sort((a, b) => b - a));
                
                setError(null);
            })
            .catch((err) => {
                setError("Failed to load inventory data");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Apply year and quarter filters
    useEffect(() => {
        let filtered = allInventory;
        
        if (selectedYear !== "all") {
            filtered = filtered.filter(item => item.Year === parseInt(selectedYear));
        }
        
        if (selectedQuarter !== "all") {
            filtered = filtered.filter(item => item.Quarter === selectedQuarter);
        }
        
        setFilteredInventory(filtered);
    }, [selectedYear, selectedQuarter, allInventory]);

    // Helper functions
    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        return expiry < today;
    };

    // Handle notification removal
    const handleRemoveNotification = (notification, type) => {
        setDeletingNotification({ notification, type });
    };

    const confirmRemoveNotification = () => {
        if (!deletingNotification) return;
        
        const key = `${deletingNotification.notification.ParticularName || deletingNotification.notification.Name}-${deletingNotification.notification.BatchNumber || ''}`;
        setDismissedNotifications([...dismissedNotifications, key]);
        setDeletingNotification(null);
    };

    const cancelRemoveNotification = () => {
        setDeletingNotification(null);
    };

    // Filter out dismissed notifications
    const filterDismissed = (items) => {
        return items.filter(item => {
            const key = `${item.ParticularName || item.Name}-${item.BatchNumber || ''}`;
            return !dismissedNotifications.includes(key);
        });
    };

    // Calculate statistics from filtered inventory
    const stats = {
        totalItems: filteredInventory.length,
        totalQuantity: filteredInventory.reduce((sum, item) => sum + Number(item.RemainingQuantity || 0), 0),
        lowStock: filteredInventory.filter(item => {
            const qty = Number(item.RemainingQuantity || 0);
            return qty > 0 && qty < 10;
        }).length,
        outOfStock: filteredInventory.filter(item => Number(item.RemainingQuantity || 0) === 0).length,
        expiringSoon: filteredInventory.filter(item => isExpiringSoon(item.ExpiryDate)).length,
        expired: filteredInventory.filter(item => isExpired(item.ExpiryDate)).length
    };

    // Prepare notifications with dismissed items filtered out
    const notifications = {
        outOfStock: filterDismissed(allInventory.filter(item => Number(item.RemainingQuantity || 0) === 0)),
        expired: filterDismissed(allInventory.filter(item => isExpired(item.ExpiryDate))),
        expiring: filterDismissed(allInventory.filter(item => isExpiringSoon(item.ExpiryDate)))
    };

    // Group items by name for out of stock display
    const groupedOutOfStockItems = [];
    const itemMap = new Map();
    
    inventory.forEach(item => {
        if (Number(item.Qty) === 0) {
            if (!itemMap.has(item.Name)) {
                itemMap.set(item.Name, {
                    Name: item.Name,
                    TotalQty: 0,
                    batches: []
                });
            }
            const grouped = itemMap.get(item.Name);
            grouped.TotalQty += Number(item.Qty);
            grouped.batches.push({
                BatchNumber: item.BatchNumber,
                Qty: Number(item.Qty),
                Unit: item.Unit,
                ExpiryDate: item.ExpiryDate
            });
        }
    });
    
    itemMap.forEach(value => groupedOutOfStockItems.push(value));

    // Prepare category chart data - count items, not quantity
    const categoryData = {};
    filteredInventory.forEach(item => {
        const category = item.Category || 'Uncategorized';
        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += 1; // Count items instead of quantity
    });
    
    if (loading) {
        return (
            <DashboardTemplate>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardTemplate>
        );
    }

    if (error) {
        return (
            <DashboardTemplate>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-red-800 font-semibold">{error}</p>
                    </div>
                </div>
            </DashboardTemplate>
        );
    }

    return (
        <DashboardTemplate>
            {/* Header with Notification Bell */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                    <p className="text-gray-600">Real-time inventory management and alerts</p>
                </div>
                <NotificationBell 
                    notifications={notifications}
                    isOpen={notificationsOpen}
                    onToggle={() => setNotificationsOpen(!notificationsOpen)}
                    onRemove={handleRemoveNotification}
                    onViewDetails={setSelectedItem}
                />
            </div>

            {/* Year and Quarter Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Filter by Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Filter by Quarter
                        </label>
                        <select
                            value={selectedQuarter}
                            onChange={(e) => setSelectedQuarter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Quarters</option>
                            <option value="Q1">Q1 (Jan-Mar)</option>
                            <option value="Q2">Q2 (Apr-Jun)</option>
                            <option value="Q3">Q3 (Jul-Sep)</option>
                            <option value="Q4">Q4 (Oct-Dec)</option>
                        </select>
                    </div>
                </div>
                
                {/* Active Filters Display */}
                {(selectedYear !== "all" || selectedQuarter !== "all") && (
                    <div className="flex items-center gap-2 flex-wrap mt-4">
                        <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                        {selectedYear !== "all" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                Year: {selectedYear}
                                <button
                                    onClick={() => setSelectedYear("all")}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedQuarter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                Quarter: {selectedQuarter}
                                <button
                                    onClick={() => setSelectedQuarter("all")}
                                    className="hover:bg-purple-200 rounded-full p-0.5"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSelectedYear("all");
                                setSelectedQuarter("all");
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Main Stats Cards - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Items</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalItems}</p>
                            <p className="text-xs text-gray-500 mt-2">In current selection</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Quantity</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalQuantity}</p>
                            <p className="text-xs text-gray-500 mt-2">All items combined</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Expiring Soon</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.expiringSoon}</p>
                            <p className="text-xs text-gray-500 mt-2">Within 30 days</p>
                        </div>
                        <div className="bg-orange-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.lowStock}</p>
                            <p className="text-xs text-gray-500 mt-2">Below 10 units</p>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Out of Stock</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.outOfStock}</p>
                            <p className="text-xs text-gray-500 mt-2">Needs restock</p>
                        </div>
                        <div className="bg-red-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Expired Items</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.expired}</p>
                            <p className="text-xs text-gray-500 mt-2">Past expiry date</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Bar Chart */}
            {Object.keys(categoryData).length > 0 && (
                <SimpleBarChart 
                    data={categoryData}
                    title="Number of Items by Category"
                />
            )}

            {/* Critical Alerts Table - Out of Stock, Expired, and Expiring Items */}
            {(groupedOutOfStockItems.length > 0 || stats.expired > 0 || stats.expiringSoon > 0) ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-100">
                        <h2 className="text-2xl font-bold text-gray-800">Critical Alerts</h2>
                        <p className="text-sm text-gray-600 mt-1">Items requiring immediate attention</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Item Name
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Batch Number
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Expiry Date
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Alert Type
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Priority
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Out of Stock Items */}
                                {filteredInventory
                                    .filter(item => Number(item.RemainingQuantity || 0) === 0)
                                    .map((item, index) => (
                                        <tr key={`out-${index}`} className="hover:bg-red-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{item.ParticularName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xl font-bold text-red-600">0</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-700">
                                                    {item.ExpiryDate 
                                                        ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                                                        : "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                                                    Out of Stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                                                    CRITICAL
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                
                                {/* Expired Items */}
                                {filteredInventory
                                    .filter(item => isExpired(item.ExpiryDate))
                                    .map((item, index) => {
                                        const daysExpired = Math.abs(Math.ceil((new Date(item.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
                                        return (
                                            <tr key={`expired-${index}`} className="hover:bg-purple-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{item.ParticularName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-lg font-semibold text-gray-900">{item.RemainingQuantity || 0}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div>
                                                        <span className="text-sm text-gray-700 block">
                                                            {new Date(item.ExpiryDate).toLocaleDateString("en-CA")}
                                                        </span>
                                                        <span className="text-xs text-purple-600 font-medium">
                                                            {daysExpired} days ago
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                        Expired
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                                                        HIGH
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                
                                {/* Expiring Soon Items */}
                                {filteredInventory
                                    .filter(item => isExpiringSoon(item.ExpiryDate) && !isExpired(item.ExpiryDate))
                                    .map((item, index) => {
                                        const daysLeft = Math.ceil((new Date(item.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <tr key={`expiring-${index}`} className="hover:bg-orange-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{item.ParticularName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-lg font-semibold text-gray-900">{item.RemainingQuantity || 0}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div>
                                                        <span className="text-sm text-gray-700 block">
                                                            {new Date(item.ExpiryDate).toLocaleDateString("en-CA")}
                                                        </span>
                                                        <span className="text-xs text-orange-600 font-medium">
                                                            {daysLeft} days left
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                                        Expiring Soon
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white">
                                                        MEDIUM
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6 shadow">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <div>
                            <p className="font-semibold text-green-800 text-lg">All Systems Green!</p>
                            <p className="text-sm text-green-700 mt-1">No critical alerts. All items are properly stocked and no items are expiring soon.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deletingNotification && (
                <ConfirmationModal
                    notification={deletingNotification.notification}
                    onConfirm={confirmRemoveNotification}
                    onCancel={cancelRemoveNotification}
                />
            )}

            {/* Item Details Modal */}
            {selectedItem && (
                <ItemDetailsModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                />
            )}
        </DashboardTemplate>
    );
}
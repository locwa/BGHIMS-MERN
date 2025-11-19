import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext.jsx";

// Request Modal Component
function RequestModal({ item, onClose, onSubmit }) {
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            setError("Please enter a valid quantity");
            return;
        }

        if (Number(quantity) > Number(item.RemainingQuantity)) {
            setError(`Cannot request more than available quantity (${item.RemainingQuantity})`);
            return;
        }

        onSubmit(Number(quantity));
    };

    return (
        <div 
            className="w-screen h-screen fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4"
            style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
        >
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Request Item</h2>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                            Review the item details and specify the quantity you need.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Item Name
                            </label>
                            <input
                                type="text"
                                value={item.ParticularName}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Batch Number
                            </label>
                            <input
                                type="text"
                                value={item.BatchNumber}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit
                            </label>
                            <input
                                type="text"
                                value={item.Unit || "N/A"}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit Cost
                            </label>
                            <input
                                type="text"
                                value={`₱${Number(item.UnitCost || 0).toLocaleString()}`}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Available Quantity
                            </label>
                            <input
                                type="text"
                                value={item.RemainingQuantity}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                value={item.ExpiryDate 
                                    ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                                    : "N/A"}
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity to Request <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={item.RemainingQuantity}
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter quantity"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum available: {item.RemainingQuantity}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ItemRequest() {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [allInventory, setAllInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestedItem, setRequestedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [viewMode, setViewMode] = useState("available"); // "available", "all", or "grouped"
    const [availableYears, setAvailableYears] = useState([]);

    const BASE_URL = "http://localhost:3000";

    const categoryOptions = [
        "hematology",
        "clinical chemistry",
        "serology",
        "blood banking",
        "clinical microscopy",
        "laboratory supplies",
        "drug testing laboratory",
        "cytology",
        "coagulation studies",
        "other"
    ];

    const getInventory = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err;
        }
    };

    const handleSubmitRequest = async (quantity) => {
        if (!requestedItem) return;

        try {
            const payload = {
                AccountId: user?.Id,
                items: [
                    {
                        AcquisitionId: requestedItem.Id,
                        BatchNumber: requestedItem.BatchNumber,
                        Quantity: quantity,
                    },
                ],
            };

            await axios.post(`${BASE_URL}/inventory/requestItem`, payload, {
                withCredentials: true,
            });

            alert("✅ Request submitted successfully!");
            setIsModalOpen(false);
            window.location.reload();
        } catch (err) {
            console.error("Failed to create request:", err.response?.data || err.message);
            alert("Failed to submit request. Please try again.");
        }
    };

    const openRequestModal = (item) => {
        setRequestedItem(item);
        setIsModalOpen(true);
    };

    useEffect(() => {
        setLoading(true);
        getInventory()
            .then((data) => {
                setAllInventory(data);
                setInventory(data);
                
                // Extract unique years
                const years = [...new Set(data.map(item => item.Year).filter(year => year))];
                setAvailableYears(years.sort((a, b) => b - a));
            })
            .catch(() => {
                alert("Failed to load inventory");
            })
            .finally(() => setLoading(false));
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = allInventory;
        
        // Year filter
        if (selectedYear !== "all") {
            filtered = filtered.filter(item => item.Year === parseInt(selectedYear));
        }
        
        // Quarter filter
        if (selectedQuarter !== "all") {
            filtered = filtered.filter(item => item.Quarter === selectedQuarter);
        }
        
        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(item => item.Category === selectedCategory);
        }
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.ParticularName.toLowerCase().includes(searchLower) ||
                item.BatchNumber.toLowerCase().includes(searchLower)
            );
        }
        
        // View mode filter
        if (viewMode === "available") {
            filtered = filtered.filter(item => Number(item.RemainingQuantity) > 0);
        }
        
        setInventory(filtered);
    }, [selectedYear, selectedQuarter, selectedCategory, searchTerm, viewMode, allInventory]);

    // Get unique items (grouped view)
    const uniqueItems = [];
    const seenNames = new Set();
    
    inventory.forEach(item => {
        if (!seenNames.has(item.ParticularName)) {
            seenNames.add(item.ParticularName);
            const totalQty = inventory
                .filter(i => i.ParticularName === item.ParticularName)
                .reduce((sum, i) => sum + Number(i.RemainingQuantity), 0);
            uniqueItems.push({...item, TotalQuantity: totalQty});
        }
    });

    const displayItems = viewMode === "grouped" ? uniqueItems : inventory;

    // Calculate stats
    const stats = {
        totalItems: allInventory.length,
        availableItems: allInventory.filter(i => Number(i.RemainingQuantity) > 0).length,
        outOfStock: allInventory.filter(i => Number(i.RemainingQuantity) === 0).length,
        filteredCount: displayItems.length
    };

    if (loading) {
        return (
            <DashboardTemplate>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading inventory...</p>
                    </div>
                </div>
            </DashboardTemplate>
        );
    }

    return (
        <DashboardTemplate>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Item Request</h1>
                <p className="text-gray-600">Browse inventory and submit requests for items you need</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Total Items</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Available Items</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.availableItems}</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Out of Stock</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.outOfStock}</p>
                        </div>
                        <div className="bg-red-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Filtered Results</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.filteredCount}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters & Search</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Year Filter */}
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

                    {/* Quarter Filter */}
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

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Filter by Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categoryOptions.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search Items
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or batch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || selectedCategory || selectedYear !== "all" || selectedQuarter !== "all") && (
                    <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
                        <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                Search: "{searchTerm}"
                                <button onClick={() => setSearchTerm("")} className="hover:bg-blue-200 rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedYear !== "all" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                Year: {selectedYear}
                                <button onClick={() => setSelectedYear("all")} className="hover:bg-green-200 rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedQuarter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                Quarter: {selectedQuarter}
                                <button onClick={() => setSelectedQuarter("all")} className="hover:bg-purple-200 rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                                <button onClick={() => setSelectedCategory("")} className="hover:bg-orange-200 rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                                setSelectedYear("all");
                                setSelectedQuarter("all");
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                        onClick={() => setViewMode("available")}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            viewMode === "available"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Available Only
                    </button>
                    <button
                        onClick={() => setViewMode("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            viewMode === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setViewMode("grouped")}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            viewMode === "grouped"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Grouped View
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            {displayItems.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No items found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your filters or search</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Particulars
                                    </th>
                                    {viewMode !== "grouped" && (
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Batch Number
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {viewMode === "grouped" ? "Total Quantity" : "Available Quantity"}
                                    </th>
                                    {viewMode !== "grouped" && (
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Expiry Date
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayItems.map((item, index) => {
                                    const qty = viewMode === "grouped" ? Number(item.TotalQuantity) : Number(item.RemainingQuantity);
                                    const isAvailable = qty > 0;
                                    
                                    return (
                                        <tr key={viewMode === "grouped" ? `${item.ParticularName}-${index}` : item.Id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.ParticularName}
                                                </div>
                                            </td>
                                            {viewMode !== "grouped" && (
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-semibold ${
                                                    qty === 0 ? 'text-red-600' : 
                                                    qty < 10 ? 'text-yellow-600' : 
                                                    'text-green-600'
                                                }`}>
                                                    {qty}
                                                </span>
                                            </td>
                                            {viewMode !== "grouped" && (
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-gray-700">
                                                        {item.ExpiryDate
                                                            ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                                                            : "N/A"}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                {isAvailable ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        Available
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {viewMode === "grouped" ? (
                                                    <button
                                                        onClick={() => {
                                                            setViewMode("all");
                                                            setSearchTerm(item.ParticularName);
                                                        }}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                        </svg>
                                                        View Batches
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openRequestModal(item)}
                                                        disabled={!isAvailable}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto ${
                                                            isAvailable
                                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                        title={isAvailable ? "Request this item" : "Out of stock"}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                                        </svg>
                                                        Request
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Request Modal */}
            {isModalOpen && requestedItem && (
                <RequestModal
                    item={requestedItem}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmitRequest}
                />
            )}
        </DashboardTemplate>
    );
}
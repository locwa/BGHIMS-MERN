import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";
import axios from 'axios'

export default function Inventory() {
    const { user, logout } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("");
    const [searchBatchNumber, setSearchBatchNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState("all"); // all, low, out, normal, expiring
    const [selectedCategory, setSelectedCategory] = useState(null); // null shows category cards, string shows items
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    const [availableYears, setAvailableYears] = useState([]);

    const categoryOptions = [
        "hematology",
        "clinical chemistry",
        "serology",
        "blood banking",
        "clinical microscopy",
        "laboratory supplies",
        "drug testing laboratory",
        "cytology",
        "coagulation studies"
    ];

    const BASE_URL = 'http://localhost:3000';

    const getInventory = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err;
        }
    };

    // Get all unique categories from inventory (including custom ones)
    // Filtered by year and quarter if selected
    const getAllCategories = () => {
        let filteredForCategories = inventory;
        
        // Apply year filter
        if (selectedYear !== "all") {
            filteredForCategories = filteredForCategories.filter(item => item.Year === parseInt(selectedYear));
        }
        
        // Apply quarter filter
        if (selectedQuarter !== "all") {
            filteredForCategories = filteredForCategories.filter(item => item.Quarter === selectedQuarter);
        }
        
        const categoriesFromData = [...new Set(
            filteredForCategories
                .map(item => item.Category)
                .filter(cat => cat && cat.trim() !== "")
        )];
        
        // Combine predefined categories with any custom categories from filtered data
        // But only show categories that actually have items in the current filter
        const allCategories = [...new Set([...categoryOptions, ...categoriesFromData])];
        
        // Filter to only show categories with items in the current year/quarter selection
        return allCategories.filter(cat => {
            const stats = getCategoryStatsForFiltering(cat, filteredForCategories);
            return stats.total > 0;
        }).sort();
    };
    
    // Helper function for filtering categories (to avoid circular dependency)
    const getCategoryStatsForFiltering = (categoryName, items) => {
        const categoryItems = items.filter(item => 
            item.Category && item.Category === categoryName
        );
        return { total: categoryItems.length };
    };

    const allCategories = getAllCategories();

    useEffect(() => {
        setLoading(true);
        getInventory()
            .then(data => {
                setInventory(data);
                setError(null);
                
                // Extract unique years from inventory
                const years = [...new Set(data.map(item => item.Year).filter(year => year))];
                setAvailableYears(years.sort((a, b) => b - a));
            })
            .catch((err) => {
                setError("Failed to load inventory");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Check if item is expiring soon (within 30 days)
    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    };

    // Check if item is expired
    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        return expiry < today;
    };

    // Categorize items based on quantity and expiry
    const categorizeItem = (qty, expiryDate) => {
        // Handle null/undefined/empty quantities
        const quantity = qty !== null && qty !== undefined ? Number(qty) : 0;
        
        if (isExpired(expiryDate)) return "expired";
        if (quantity === 0 || isNaN(quantity)) return "out";
        if (quantity < 10) return "low";
        if (isExpiringSoon(expiryDate)) return "expiring";
        return "normal";
    };

    // Get status info for display
    const getStatusInfo = (qty, expiryDate) => {
        const category = categorizeItem(qty, expiryDate);
        const configs = {
            expired: {
                label: "Expired",
                bgColor: "bg-purple-100",
                textColor: "text-purple-800",
                dotColor: "bg-purple-500",
                rowBg: "bg-purple-50"
            },
            out: {
                label: "Out of Stock",
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                dotColor: "bg-red-500",
                rowBg: "bg-red-50"
            },
            low: {
                label: "Low Stock",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-800",
                dotColor: "bg-yellow-500",
                rowBg: "bg-yellow-50"
            },
            expiring: {
                label: "Expiring Soon",
                bgColor: "bg-orange-100",
                textColor: "text-orange-800",
                dotColor: "bg-orange-500",
                rowBg: "bg-orange-50"
            },
            normal: {
                label: "In Stock",
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                dotColor: "bg-green-500",
                rowBg: "bg-white"
            }
        };
        return configs[category];
    };

    // Apply all filters
    const filteredInventory = inventory.filter(item => {
        // Search filters
        const matchesParticular = searchParticularTerm === "" || 
            item.ParticularName.toLowerCase().includes(searchParticularTerm.toLowerCase());
        
        const matchesBatch = searchBatchNumber === "" || 
            item.BatchNumber.toLowerCase().includes(searchBatchNumber.toLowerCase());
        
        // Stock status filter
        const matchesStockStatus = filterCategory === "all" || 
            categorizeItem(item.RemainingQuantity, item.ExpiryDate) === filterCategory;

        // Category filter
        const matchesCategory = selectedCategory === null || 
            (item.Category && item.Category === selectedCategory);

        // Year filter
        const matchesYear = selectedYear === "all" || 
            item.Year === parseInt(selectedYear);

        // Quarter filter
        const matchesQuarter = selectedQuarter === "all" || 
            item.Quarter === selectedQuarter;

        return matchesParticular && matchesBatch && matchesStockStatus && 
               matchesCategory && matchesYear && matchesQuarter;
    });

    // Get category statistics (respecting year and quarter filters)
    const getCategoryStats = (categoryName) => {
        let categoryItems = inventory.filter(item => 
            item.Category && item.Category === categoryName
        );
        
        // Apply year filter
        if (selectedYear !== "all") {
            categoryItems = categoryItems.filter(item => item.Year === parseInt(selectedYear));
        }
        
        // Apply quarter filter
        if (selectedQuarter !== "all") {
            categoryItems = categoryItems.filter(item => item.Quarter === selectedQuarter);
        }
        
        const stats = {
            total: categoryItems.length,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            expiring: 0,
            expired: 0
        };
        
        categoryItems.forEach(item => {
            const category = categorizeItem(item.RemainingQuantity, item.ExpiryDate);
            if (category === "normal") stats.inStock++;
            else if (category === "low") stats.lowStock++;
            else if (category === "out") stats.outOfStock++;
            else if (category === "expiring") stats.expiring++;
            else if (category === "expired") stats.expired++;
        });
        
        return stats;
    };

    // Calculate overall stats
    const stats = {
        total: inventory.length,
        outOfStock: inventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "out").length,
        lowStock: inventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "low").length,
        inStock: inventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "normal").length,
        expiring: inventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "expiring").length,
        expired: inventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "expired").length
    };

    // Get color for category card
    const getCategoryColor = (index) => {
        const colors = [
            "border-blue-500 bg-blue-50",
            "border-green-500 bg-green-50",
            "border-purple-500 bg-purple-50",
            "border-orange-500 bg-orange-50",
            "border-pink-500 bg-pink-50",
            "border-indigo-500 bg-indigo-50",
            "border-teal-500 bg-teal-50",
            "border-red-500 bg-red-50",
            "border-yellow-500 bg-yellow-50",
        ];
        return colors[index % colors.length];
    };

    const getCategoryIconColor = (index) => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-green-100 text-green-600",
            "bg-purple-100 text-purple-600",
            "bg-orange-100 text-orange-600",
            "bg-pink-100 text-pink-600",
            "bg-indigo-100 text-indigo-600",
            "bg-teal-100 text-teal-600",
            "bg-red-100 text-red-600",
            "bg-yellow-100 text-yellow-600",
        ];
        return colors[index % colors.length];
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Management</h1>
                        <p className="text-gray-600">Monitor and manage hospital inventory by category</p>
                    </div>
                    {selectedCategory && (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Categories
                        </button>
                    )}
                </div>
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

            {/* Show Category Cards or Item List based on selection */}
            {selectedCategory === null ? (
                // Category Cards View
                <>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Browse by Category</h2>
                        <p className="text-gray-600 text-sm">Click on a category to view items</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allCategories.map((category, index) => {
                            const categoryStats = getCategoryStats(category);
                            return (
                                <div
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`${getCategoryColor(index)} border-l-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 capitalize mb-1">
                                                {category}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {categoryStats.total} items
                                            </p>
                                        </div>
                                        <div className={`${getCategoryIconColor(index)} rounded-full p-3`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-5 gap-1 text-center">
                                        <div className="bg-white bg-opacity-60 rounded p-2">
                                            <p className="text-xs text-gray-600">Stock</p>
                                            <p className="text-base font-bold text-green-600">{categoryStats.inStock}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded p-2">
                                            <p className="text-xs text-gray-600">Low</p>
                                            <p className="text-base font-bold text-yellow-600">{categoryStats.lowStock}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded p-2">
                                            <p className="text-xs text-gray-600">Out</p>
                                            <p className="text-base font-bold text-red-600">{categoryStats.outOfStock}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded p-2">
                                            <p className="text-xs text-gray-600">Exp.</p>
                                            <p className="text-base font-bold text-orange-600">{categoryStats.expiring}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded p-2">
                                            <p className="text-xs text-gray-600">Old</p>
                                            <p className="text-base font-bold text-purple-600">{categoryStats.expired}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center text-sm text-gray-600 hover:text-gray-800">
                                        <span>View items</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // Item List View for Selected Category
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{filteredInventory.length}</p>
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
                                    <p className="text-gray-500 text-xs font-medium">In Stock</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {filteredInventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "normal").length}
                                    </p>
                                </div>
                                <div className="bg-green-100 rounded-full p-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium">Low Stock</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {filteredInventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "low").length}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 rounded-full p-2">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium">Out of Stock</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {filteredInventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "out").length}
                                    </p>
                                </div>
                                <div className="bg-red-100 rounded-full p-2">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium">Expiring Soon</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {filteredInventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "expiring").length}
                                    </p>
                                </div>
                                <div className="bg-orange-100 rounded-full p-2">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium">Expired</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {filteredInventory.filter(item => categorizeItem(item.RemainingQuantity, item.ExpiryDate) === "expired").length}
                                    </p>
                                </div>
                                <div className="bg-purple-100 rounded-full p-2">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Search by Particular
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter item name..."
                                    value={searchParticularTerm}
                                    onChange={(e) => setSearchParticularTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Search by Batch Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter batch number..."
                                    value={searchBatchNumber}
                                    onChange={(e) => setSearchBatchNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Stock Status Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterCategory("all")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                All Items
                            </button>
                            <button
                                onClick={() => setFilterCategory("normal")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "normal"
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                In Stock
                            </button>
                            <button
                                onClick={() => setFilterCategory("low")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "low"
                                        ? "bg-yellow-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Low Stock
                            </button>
                            <button
                                onClick={() => setFilterCategory("out")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "out"
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Out of Stock
                            </button>
                            <button
                                onClick={() => setFilterCategory("expiring")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "expiring"
                                        ? "bg-orange-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Expiring Soon
                            </button>
                            <button
                                onClick={() => setFilterCategory("expired")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterCategory === "expired"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Expired
                            </button>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    {error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-red-800 font-semibold">{error}</p>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <p className="text-gray-500 text-lg">No items found in this category</p>
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
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Batch Number
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Year
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Quarter
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Expiry Date
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredInventory.map((item, index) => {
                                            const statusInfo = getStatusInfo(item.RemainingQuantity, item.ExpiryDate);
                                            const daysUntilExpiry = item.ExpiryDate 
                                                ? Math.ceil((new Date(item.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                                                : null;
                                            
                                            return (
                                                <tr key={index} className={`${statusInfo.rowBg} hover:bg-gray-100 transition`}>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.ParticularName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-gray-700">
                                                            {item.BatchNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-gray-700">
                                                            {item.Year || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-gray-700">
                                                            {item.Quarter || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {item.RemainingQuantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div>
                                                            <span className="text-sm text-gray-700 block">
                                                                {item.ExpiryDate
                                                                    ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                                                                    : "N/A"}
                                                            </span>
                                                            {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && (
                                                                <span className="text-xs text-orange-600 font-medium">
                                                                    ({daysUntilExpiry} days left)
                                                                </span>
                                                            )}
                                                            {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
                                                                <span className="text-xs text-purple-600 font-medium">
                                                                    (Expired {Math.abs(daysUntilExpiry)} days ago)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                            <span className={`w-2 h-2 ${statusInfo.dotColor} rounded-full mr-2`}></span>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </DashboardTemplate>
    );
}
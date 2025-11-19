import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import { useEffect, useState } from "react";
import axios from "axios";

export default function GenerateReport() {
    const [yearChoices, setYearChoices] = useState([]);
    const [year, setYear] = useState('');
    const [quarter, setQuarter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateInventory, setDateInventory] = useState([]);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'transactions'

    const BASE_URL = "http://localhost:3000";

    const generateReport = async () => {
        if (!year || !quarter) {
            alert("Please select a year and quarter.");
            return;
        }

        setGeneratingReport(true);
        try {
            console.log('Requesting report for:', { year, quarter });
            
            const res = await axios.post(
                `${BASE_URL}/inventory/report`,
                { year, quarter },
                {
                    responseType: "blob",
                    withCredentials: true,
                    timeout: 60000, // 60 second timeout
                }
            );

            console.log('Report received, creating download...');

            // Check if response is actually a blob (not an error JSON)
            if (res.data.type === 'application/json') {
                const text = await res.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.error || errorData.message || 'Failed to generate report');
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `inventory_${year}_${quarter}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            console.log('Download initiated successfully');
            alert("Report generated successfully!");

        } catch (err) {
            console.error("Error generating report:", err);
            console.error("Error response:", err.response?.data);
            
            let errorMessage = "Failed to generate report";
            
            if (err.response?.data) {
                // If error response is a Blob, convert it to text
                if (err.response.data instanceof Blob) {
                    try {
                        const text = await err.response.data.text();
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (parseErr) {
                        console.error('Could not parse error response:', parseErr);
                    }
                } else {
                    errorMessage = err.response.data.message || err.response.data.error || errorMessage;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setGeneratingReport(false);
        }
    };

    const fetchInventoryByDateRange = async (start, end) => {
        if (!start || !end) return;
        
        setLoading(true);
        try {
            // Build URL with proper query parameters
            const url = `${BASE_URL}/inventory?startDate=${start}&endDate=${end}`;
            console.log('Fetching inventory from:', url); // Debug
            
            const res = await axios.get(url, {
                withCredentials: true
            });
            console.log('Inventory response:', res.data); // Debug
            setDateInventory(res.data);
        } catch (err) {
            console.error("Failed to fetch inventory for date range:", err);
            console.error("Error response:", err.response?.data); // Debug
            setDateInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionHistory = async (start, end) => {
        if (!start || !end) return;
        
        setLoadingTransactions(true);
        try {
            // Build URL with proper query parameters
            const url = `${BASE_URL}/transactions/history?startDate=${start}&endDate=${end}`;
            console.log('Fetching transactions from:', url); // Debug
            
            const res = await axios.get(url, {
                withCredentials: true
            });
            console.log('Transaction response:', res.data); // Debug
            setTransactionHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch transaction history:", err);
            console.error("Error response:", err.response?.data); // Debug
            setTransactionHistory([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/inventory/years`, {
                    withCredentials: true
                });
                setYearChoices(res.data);
            } catch (err) {
                console.error("Failed to fetch years:", err);
            }
        };

        fetchYears();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            // Validate that end date is not before start date
            if (new Date(endDate) >= new Date(startDate)) {
                fetchInventoryByDateRange(startDate, endDate);
                fetchTransactionHistory(startDate, endDate);
            }
        }
    }, [startDate, endDate]);

    // Calculate stats for selected date
    const stats = {
        total: dateInventory.length,
        totalQuantity: dateInventory.reduce((sum, item) => sum + Number(item.RemainingQuantity || 0), 0),
        lowStock: dateInventory.filter(item => Number(item.RemainingQuantity) < 10 && Number(item.RemainingQuantity) > 0).length,
        outOfStock: dateInventory.filter(item => Number(item.RemainingQuantity) === 0).length,
        totalTransactions: transactionHistory.length,
        totalItemsRequested: transactionHistory.reduce((sum, trans) => sum + (trans.items?.length || 0), 0)
    };

    return (
        <DashboardTemplate>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Generate Reports</h1>
                <p className="text-gray-600">Generate quarterly reports, view inventory, and track transactions by date</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Available Years</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{yearChoices.length}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs font-medium">Reports Generated</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">-</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quarterly Report Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Generate Quarterly Report
                </h2>
                <p className="text-gray-600 mb-6">Select a year and quarter to generate an Excel report</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                            Year
                        </label>
                        <select
                            name="year"
                            id="year"
                            value={year}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="" disabled>Choose Year</option>
                            {yearChoices.map((yr) => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="quarter" className="block text-sm font-semibold text-gray-700 mb-2">
                            Quarter
                        </label>
                        <select
                            name="quarter"
                            id="quarter"
                            value={quarter}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={(e) => setQuarter(e.target.value)}
                        >
                            <option value="" disabled>Choose Quarter</option>
                            <option value="Q1">1st Quarter (Jan-Mar)</option>
                            <option value="Q2">2nd Quarter (Apr-Jun)</option>
                            <option value="Q3">3rd Quarter (Jul-Sep)</option>
                            <option value="Q4">4th Quarter (Oct-Dec)</option>
                        </select>
                    </div>
                </div>

                <button
                    className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 ${
                        generatingReport || !year || !quarter
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={generateReport}
                    disabled={generatingReport || !year || !quarter}
                >
                    {generatingReport ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Generating Report...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Generate Report
                        </>
                    )}
                </button>
            </div>

            {/* Date Range Picker Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    View Data by Date Range
                </h2>
                <p className="text-gray-600 mb-6">Select a date range to view inventory status and transaction history</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            max={endDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            min={startDate}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Date Range Indicator */}
                {startDate && endDate && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className="text-purple-800 font-medium">
                                Viewing data from {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {new Date(endDate) < new Date(startDate) && (
                                    <span className="text-red-600 ml-2">(Invalid: End date must be after start date)</span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
                    <>
                        {/* Date Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-blue-600 text-xs font-medium">Total Items</p>
                                <p className="text-2xl font-bold text-blue-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-green-600 text-xs font-medium">Total Quantity</p>
                                <p className="text-2xl font-bold text-green-800 mt-1">{stats.totalQuantity}</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <p className="text-yellow-600 text-xs font-medium">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.lowStock}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-red-600 text-xs font-medium">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-800 mt-1">{stats.outOfStock}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p className="text-purple-600 text-xs font-medium">Transactions</p>
                                <p className="text-2xl font-bold text-purple-800 mt-1">{stats.totalTransactions}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <p className="text-indigo-600 text-xs font-medium">Items Requested</p>
                                <p className="text-2xl font-bold text-indigo-800 mt-1">{stats.totalItemsRequested}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('inventory')}
                                    className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'inventory'
                                            ? 'border-purple-600 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                        </svg>
                                        Inventory Status
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'transactions'
                                            ? 'border-purple-600 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        Transaction History
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Inventory Tab */}
                        {activeTab === 'inventory' && (
                            <>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                                            <p className="text-gray-600">Loading inventory...</p>
                                        </div>
                                    </div>
                                ) : dateInventory.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                        </svg>
                                        <p className="text-gray-500 text-lg font-medium mb-2">No inventory found</p>
                                        <p className="text-gray-400 text-sm">No items available for the selected date</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                                            Quantity
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Unit
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
                                                    {dateInventory.map((item, index) => {
                                                        const qty = Number(item.RemainingQuantity || 0);
                                                        const status = qty === 0 ? 'out' : qty < 10 ? 'low' : 'normal';
                                                        const statusConfig = {
                                                            out: { label: 'Out of Stock', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
                                                            low: { label: 'Low Stock', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
                                                            normal: { label: 'In Stock', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' }
                                                        };
                                                        const config = statusConfig[status];

                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                                <td className="px-6 py-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {item.ParticularName}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="text-sm font-semibold text-gray-900">{qty}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="text-sm text-gray-700">{item.Unit || 'N/A'}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="text-sm text-gray-700">
                                                                        {item.ExpiryDate
                                                                            ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                                                                            : "N/A"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                                                                        <span className={`w-2 h-2 ${config.dot} rounded-full mr-2`}></span>
                                                                        {config.label}
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

                        {/* Transaction History Tab */}
                        {activeTab === 'transactions' && (
                            <>
                                {loadingTransactions ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                                            <p className="text-gray-600">Loading transactions...</p>
                                        </div>
                                    </div>
                                ) : transactionHistory.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        <p className="text-gray-500 text-lg font-medium mb-2">No transactions found</p>
                                        <p className="text-gray-400 text-sm">No item requests for the selected date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactionHistory.map((transaction, index) => (
                                            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                {/* Transaction Header */}
                                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-purple-100 rounded-full p-2">
                                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{transaction.RequesterName}</p>
                                                                <p className="text-sm text-gray-600">{transaction.JobTitle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(transaction.DateAdded).toLocaleDateString("en-US", {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(transaction.DateAdded).toLocaleTimeString("en-US", {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Item Name
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Batch Number
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Quantity Taken
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                            {transaction.items && transaction.items.length > 0 ? (
                                                                transaction.items.map((item, itemIndex) => (
                                                                    <tr key={itemIndex} className="hover:bg-gray-50">
                                                                        <td className="px-6 py-3">
                                                                            <span className="text-sm font-medium text-gray-900">{item.ItemName}</span>
                                                                        </td>
                                                                        <td className="px-6 py-3 text-center">
                                                                            <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                                                                        </td>
                                                                        <td className="px-6 py-3 text-center">
                                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                                                                {item.Quantity}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                                        No items recorded
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </DashboardTemplate>
    );
}
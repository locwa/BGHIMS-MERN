import { useContext, useEffect, useState } from "react";
import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

// Modal Component
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

export default function AddOrEditParticulars() {
  const { user } = useContext(AuthContext);
  
  const [inventory, setInventory] = useState([]);
  const [searchParticularTerm, setSearchParticularTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "all"
  const [selectedCategory, setSelectedCategory] = useState(""); // Category filter
  const [isAddingStock, setIsAddingStock] = useState(false); // Flag to track if adding stock to existing item

  const [procurementId, setProcurementId] = useState("");
  const [particularName, setParticularName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [unit, setUnit] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [quarter, setQuarter] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const unitOptions = ["bx", "bot", "kits", "vial", "pack", "tray", "tubes", "pc", "set", "roll", "other"];
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

  const BASE_URL = "http://localhost:3000";

  const getInventory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/inventory`, {
        credentials: 'include'
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      throw err;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!particularName.trim()) {
      newErrors.particularName = "Item name is required";
    }

    if (!batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required";
    }

    if (!unit) {
      newErrors.unit = "Unit is required";
    }

    if (unit === "other" && !customUnit.trim()) {
      newErrors.customUnit = "Please specify the custom unit";
    }

    if (!quantity || Number(quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (quantity && !Number.isInteger(Number(quantity))) {
      newErrors.quantity = "Quantity must be a whole number";
    }

    if (!unitCost || Number(unitCost) < 0) {
      newErrors.unitCost = "Unit cost must be 0 or greater";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const selectedDate = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past";
      }
    }

    if (!year) {
      newErrors.year = "Year is required";
    }

    if (!quarter) {
      newErrors.quarter = "Quarter is required";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    if (category === "other" && !customCategory.trim()) {
      newErrors.customCategory = "Please specify the custom category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddExistingItem = (item) => {
    setIsAddingStock(true); // Set flag to true
    setModalTitle("Add Stock to Existing Item");
    setParticularName(item.ParticularName);
    setBatchNumber("");
    
    // Set unit (read-only when adding stock)
    if (unitOptions.includes(item.Unit)) {
      setUnit(item.Unit);
      setCustomUnit("");
    } else {
      setUnit("other");
      setCustomUnit(item.Unit || "");
    }
    
    setUnitCost("");
    setQuantity("");
    setExpiryDate("");
    setRemarks(item.Remarks || "");
    setYear(new Date().getFullYear().toString());
    setQuarter("");
    
    // Set category (read-only when adding stock)
    if (categoryOptions.includes(item.Category)) {
      setCategory(item.Category || "");
      setCustomCategory("");
    } else {
      setCategory("other");
      setCustomCategory(item.Category || "");
    }
    
    setProcurementId("");
    setErrors({});
    setIsModalOpen(true);
  };

  const openAddNewItem = () => {
    setIsAddingStock(false); // Set flag to false
    setModalTitle("Add New Item");
    setParticularName("");
    setBatchNumber("");
    setUnit("");
    setCustomUnit("");
    setUnitCost("");
    setQuantity("");
    setExpiryDate("");
    setRemarks("");
    setYear(new Date().getFullYear().toString());
    setQuarter("");
    setCategory("");
    setCustomCategory("");
    setProcurementId("");
    setErrors({});
    setIsModalOpen(true);
  };

  const editItem = (item) => {
    setIsAddingStock(false); // Set flag to false
    setModalTitle("Edit Item");
    setProcurementId(item.Id);
    setParticularName(item.ParticularName);
    setBatchNumber(item.BatchNumber);
    
    // Check if unit is in predefined options
    if (unitOptions.includes(item.Unit)) {
      setUnit(item.Unit);
      setCustomUnit("");
    } else {
      setUnit("other");
      setCustomUnit(item.Unit || "");
    }
    
    setUnitCost(item.UnitCost || "");
    setQuantity(item.RemainingQuantity || "");
    setExpiryDate(item.ExpiryDate ? new Date(item.ExpiryDate).toISOString().split("T")[0] : "");
    setRemarks(item.Remarks || "");
    setYear(item.Year || new Date().getFullYear().toString());
    setQuarter(item.Quarter || "");
    
    // Check if category is in predefined options
    if (categoryOptions.includes(item.Category)) {
      setCategory(item.Category || "");
      setCustomCategory("");
    } else {
      setCategory("other");
      setCustomCategory(item.Category || "");
    }
    
    setErrors({});
    setIsModalOpen(true);
  };

  const addItem = async () => {
    if (!validateForm()) return;

    const finalUnit = unit === "other" ? customUnit.trim() : unit;
    const finalCategory = category === "other" ? customCategory.trim() : category;

    const postData = {
      Name: particularName.trim(),
      Unit: finalUnit,
      Category: finalCategory,
      BatchNumber: batchNumber.trim(),
      UnitCost: parseFloat(unitCost),
      Quantity: parseInt(quantity),
      ExpiryDate: expiryDate,
      Remarks: remarks.trim(),
      Year: parseInt(year),
      Quarter: quarter,
      ReceivingUser: user.Id,
      DateReceived: new Date().toISOString(),
    };
    
    try {
      const response = await fetch(`${BASE_URL}/inventory/addItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item');
      }
      
      const data = await response.json();
      console.log("Response:", data);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const updateItem = async (id) => {
    if (!validateForm()) return;

    const finalUnit = unit === "other" ? customUnit.trim() : unit;
    const finalCategory = category === "other" ? customCategory.trim() : category;

    // When editing, the quantity field shows RemainingQuantity
    // We need to update the ProcurementLog's original Quantity to reflect the change
    // Calculate the difference: new remaining qty - old remaining qty
    const oldRemainingQty = inventory.find(item => item.Id === id)?.RemainingQuantity || 0;
    const newRemainingQty = parseInt(quantity);
    const qtyDifference = newRemainingQty - oldRemainingQty;

    const postData = {
      Id: id,
      Name: particularName.trim(),
      Unit: finalUnit,
      Category: finalCategory,
      BatchNumber: batchNumber.trim(),
      UnitCost: parseFloat(unitCost),
      QuantityAdjustment: qtyDifference, // Send the adjustment amount
      ExpiryDate: expiryDate,
      Remarks: remarks.trim(),
      Year: parseInt(year),
      Quarter: quarter,
      ReceivingUser: user.Id,
      DateReceived: new Date().toISOString(),
    };
    
    console.log("Update data being sent:", postData);
    
    try {
      const response = await fetch(`${BASE_URL}/inventory/updateItem/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        let errorMessage = 'Failed to update item';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Update successful:", data);
      alert("Item updated successfully!");
      setIsModalOpen(false);
      
      // Refresh inventory data instead of reloading page
      setLoading(true);
      getInventory()
        .then((data) => {
          setInventory(data);
        })
        .catch(() => {
          alert("Failed to reload inventory");
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error updating item: ${error.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalTitle.includes("Edit")) {
      updateItem(procurementId);
    } else {
      addItem();
    }
  };

  useEffect(() => {
    setLoading(true);
    getInventory()
      .then((data) => {
        setInventory(data);
      })
      .catch(() => {
        alert("Failed to load inventory");
      })
      .finally(() => setLoading(false));
  }, []);

  // Client-side search and category filtering
  const filteredInventory = inventory.filter(item => {
    const searchLower = searchParticularTerm.toLowerCase();
    const matchesSearch = searchParticularTerm === "" || 
      item.ParticularName.toLowerCase().includes(searchLower) ||
      item.BatchNumber.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategory === "" || 
      item.Category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique items (group by ParticularName)
  const uniqueItems = [];
  const seenNames = new Set();
  
  filteredInventory.forEach(item => {
    if (!seenNames.has(item.ParticularName)) {
      seenNames.add(item.ParticularName);
      // Calculate total quantity for this item
      const totalQty = filteredInventory
        .filter(i => i.ParticularName === item.ParticularName)
        .reduce((sum, i) => sum + Number(i.RemainingQuantity), 0);
      uniqueItems.push({...item, TotalQuantity: totalQty});
    }
  });

  const displayItems = viewMode === "grouped" ? uniqueItems : filteredInventory;

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add/Edit Particulars</h1>
        <p className="text-gray-600">Search for existing items to add more stock, or create new inventory entries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Total Unique Items</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{uniqueItems.length}</p>
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
              <p className="text-gray-500 text-xs font-medium">Total Stock Entries</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{inventory.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium">Search Results</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{displayItems.length}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Items
              </label>
              <input
                type="text"
                placeholder="Search by item name or batch number..."
                value={searchParticularTerm}
                onChange={(e) => setSearchParticularTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-64">
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
            
            <button
              onClick={openAddNewItem}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Item
            </button>
          </div>

          {/* Active Filters Display */}
          {(searchParticularTerm || selectedCategory) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchParticularTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchParticularTerm}"
                  <button
                    onClick={() => setSearchParticularTerm("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  <button
                    onClick={() => setSelectedCategory("")}
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
                  setSearchParticularTerm("");
                  setSelectedCategory("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "grouped"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Grouped View
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Batches
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {displayItems.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No items found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or add a new item</p>
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
                  {viewMode === "all" && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Batch Number
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {viewMode === "grouped" ? "Total Quantity" : "Quantity"}
                  </th>
                  {viewMode === "all" && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Expiry Date
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayItems.map((item, index) => (
                  <tr key={viewMode === "grouped" ? `${item.ParticularName}-${index}` : item.Id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.ParticularName}</div>
                    </td>
                    {viewMode === "all" && (
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-700">{item.BatchNumber}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {viewMode === "grouped" ? item.TotalQuantity : item.RemainingQuantity}
                      </span>
                    </td>
                    {viewMode === "all" && (
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-700">
                          {item.ExpiryDate
                            ? new Date(item.ExpiryDate).toLocaleDateString("en-CA")
                            : "N/A"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openAddExistingItem(item)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                          title="Add more stock"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                          </svg>
                          Add Stock
                        </button>
                        {viewMode === "all" && (
                          <button
                            onClick={() => editItem(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                            title="Edit item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal title={modalTitle} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Info banner when adding stock */}
            {isAddingStock && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Adding stock to existing item</p>
                    <p className="text-xs text-blue-700 mt-1">Item name, category, and unit are locked. You can only add a new batch with its quantity, cost, and expiry date.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Item Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={particularName}
                onChange={(e) => setParticularName(e.target.value)}
                placeholder="e.g., M53 Cleanser, 1L"
                disabled={isAddingStock}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isAddingStock ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors.particularName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.particularName && (
                <p className="text-red-500 text-xs mt-1">{errors.particularName}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isAddingStock}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isAddingStock ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "other" ? "Other (specify)" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Custom Category (shown only when "other" is selected) */}
            {category === "other" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specify Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g., Microbiology, Pathology, etc."
                  disabled={isAddingStock}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isAddingStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.customCategory ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.customCategory && (
                  <p className="text-red-500 text-xs mt-1">{errors.customCategory}</p>
                )}
              </div>
            )}

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., NNO-123"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.batchNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.batchNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.batchNumber}</p>
              )}
            </div>

            {/* Two Column Layout - Year and Quarter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2025"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                )}
              </div>

              {/* Quarter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quarter <span className="text-red-500">*</span>
                </label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quarter ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select quarter</option>
                  <option value="Q1">Q1 (Jan-Mar)</option>
                  <option value="Q2">Q2 (Apr-Jun)</option>
                  <option value="Q3">Q3 (Jul-Sep)</option>
                  <option value="Q4">Q4 (Oct-Dec)</option>
                </select>
                {errors.quarter && (
                  <p className="text-red-500 text-xs mt-1">{errors.quarter}</p>
                )}
              </div>
            </div>

            {/* Two Column Layout - Unit and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={isAddingStock}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isAddingStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u === "other" ? "Other (specify)" : u}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 50"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>

            {/* Custom Unit (shown only when "other" is selected) */}
            {unit === "other" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specify Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="e.g., bag, container, etc."
                  disabled={isAddingStock}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isAddingStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.customUnit ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.customUnit && (
                  <p className="text-red-500 text-xs mt-1">{errors.customUnit}</p>
                )}
              </div>
            )}

            {/* Two Column Layout - Unit Cost and Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="e.g., 18000"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unitCost ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.unitCost && (
                  <p className="text-red-500 text-xs mt-1">{errors.unitCost}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any additional notes or remarks..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
  );
}
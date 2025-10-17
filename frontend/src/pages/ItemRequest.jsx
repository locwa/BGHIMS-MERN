import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "../components/Modal.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

export default function ItemRequest() {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("");
    const [searchBatchNumber, setSearchBatchNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestedItem, setRequestedItem] = useState(null);
    const [requestedQuantity, setRequestedQuantity] = useState("");

    const BASE_URL = "http://localhost:3000";

    // ✅ Fetch inventory with filters
    const getInventory = async (particularTerm = "", batchNumber = "") => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                params: {
                    particularSearch: particularTerm,
                    batchNumber: batchNumber,
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err;
        }
    };

    // ✅ Function: Submit item request
    const handleSubmitRequest = async () => {
        if (!requestedItem) return;
        if (!requestedQuantity || isNaN(requestedQuantity) || requestedQuantity <= 0) {
            alert("Please enter a valid quantity");
            return;
        }

        try {
            const payload = {
                AccountId: user?.Id, // from logged-in user
                items: [
                    {
                        AcquisitionId: requestedItem.Id, // ProcurementLog Id
                        BatchNumber: requestedItem.BatchNumber,
                        Quantity: parseInt(requestedQuantity, 10),
                    },
                ],
            };

            const res = await axios.post(`${BASE_URL}/inventory/requestItem`, payload, {
                withCredentials: true,
            });

            alert("✅ Request successfully created!");
            console.log(res.data);
            setIsModalOpen(false);
            setRequestedQuantity("");
            window.location.reload()
        } catch (err) {
            console.error("❌ Failed to create request:", err.response?.data || err.message);
            alert("Failed to send request.");
        }
    };

    const openRequestOverview = (item) => {
        setRequestedItem(item);
        console.log(item)
        setIsModalOpen(true);
    };

    useEffect(() => {
        getInventory(searchParticularTerm, searchBatchNumber)
            .then((data) => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, [searchParticularTerm, searchBatchNumber]);

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Item Request</h1>

            {/* 🔍 Search Inputs */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search Particular"
                    value={searchParticularTerm}
                    onChange={(e) => setSearchParticularTerm(e.target.value)}
                    className="border my-4 px-2"
                />
                <input
                    type="text"
                    placeholder="Search Batch Number"
                    value={searchBatchNumber}
                    onChange={(e) => setSearchBatchNumber(e.target.value)}
                    className="border my-4 px-2"
                />
            </div>

            {/* 📦 Inventory Table */}
            <table className="mt-4 w-full">
                <thead>
                <tr className="border border-collapse bg-gray-100">
                    <th className="px-2 border text-center">Particulars</th>
                    <th className="px-2 border text-center">Batch Number</th>
                    <th className="px-2 border text-center">Quantity</th>
                    <th className="px-2 border text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                {inventory.map((item) => (
                    <tr key={item.Id}>
                        <td className="border px-2">{item.ParticularName}</td>
                        <td className="border px-2 text-center">{item.BatchNumber}</td>
                        <td className="border px-2 text-center">{item.RemainingQuantity}</td>
                        <td className="border px-2 text-center">
                            <button
                                className="bg-blue-500 border rounded-md p-1 hover:cursor-pointer h-10 w-48 text-white"
                                onClick={() => openRequestOverview(item)}
                            >
                                <FontAwesomeIcon
                                    icon={["fas", "hand-holding-medical"]}
                                    className="pr-2"
                                />
                                Request Item
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 🪟 Modal */}
            {isModalOpen && requestedItem && (
                <Modal>
                    <div className="w-full flex justify-end">
                        <button
                            className="hover:cursor-pointer"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <FontAwesomeIcon icon={["fas", "x"]} />
                        </button>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">Request Item</h1>
                        <p className="text-sm">Confirm the details and specify quantity:</p>

                        <div className="mt-4 flex flex-col gap-y-2">
                            <div className="flex flex-col">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 p-2 border"
                                    value={requestedItem.ParticularName}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>Batch Number</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 p-2 border"
                                    value={requestedItem.BatchNumber}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>Unit</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 p-2 border"
                                    value={requestedItem.Unit}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>Unit Cost</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 p-2 border"
                                    value={requestedItem.UnitCost}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>Available Quantity</label>
                                <input
                                    type="text"
                                    className="bg-gray-100 p-2 border"
                                    value={requestedItem.RemainingQuantity}
                                    disabled
                                />
                            </div>

                            <div className="flex flex-col">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    className="bg-gray-100 p-2 border"
                                    value={
                                        new Date(requestedItem.ExpiryDate)
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    disabled
                                />
                            </div>

                            {/* ✅ User-input quantity */}
                            <div className="flex flex-col">
                                <label>Quantity to Request</label>
                                <input
                                    type="number"
                                    className="border p-2"
                                    placeholder="Enter quantity"
                                    value={requestedQuantity}
                                    onChange={(e) => setRequestedQuantity(e.target.value)}
                                />
                            </div>

                            <button
                                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mt-3"
                                onClick={handleSubmitRequest}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardTemplate>
    );
}

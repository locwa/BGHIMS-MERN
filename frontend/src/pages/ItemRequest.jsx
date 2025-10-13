import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import axios from 'axios'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "../components/Modal.jsx";
import {AuthContext} from "../contexts/AuthContext.jsx";

export default function ItemRequest() {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("")
    const [searchBatchNumber, setSearchBatchNumber] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [requesteditem, setRequesteditem] = useState([])

    const BASE_URL = 'http://localhost:3000';

    const getInventory = async (particularTerm = "", batchNumber = "") => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                params: {
                    particularSearch: particularTerm,
                    batchNumber: batchNumber
                },
                withCredentials: true
            });
            return res.data; // ✅ return just the data, not the whole response object
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err; // optional, to handle it in your component
        }
    };

    const openRequestOverview = (item) => {
        console.log(item)
        setRequesteditem(item)
        setIsModalOpen(true)
    }

    useEffect(() => {
        getInventory(searchParticularTerm, searchBatchNumber)
            .then(data => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, [searchParticularTerm, searchBatchNumber]);

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Item Request</h1>

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

            <table className="mt-4 w-full">
                <tr className="border border-collapse">
                    <th className="px-2 border border-collapse text-center">Particulars</th>
                    <th className="px-2 border border-collapse text-center">Batch Number</th>
                    <th className="px-2 border border-collapse text-center">Quantity</th>
                </tr>
                {inventory.map((item) => (
                    <tr>
                        <td className="pr-2 border border-collapse ">{item.Particular.Name}</td>
                        <td className="pr-2 border border-collapse text-center">{item.BatchNumber}</td>
                        <td className="pr-2 border border-collapse text-center">{item.Quantity}</td>
                        <td className="border border-collapse text-center">
                            <button
                                className="bg-blue-500 border rounded-md p-1 hover:cursor-pointer h-10 w-48 text-white"
                                onClick={() => openRequestOverview(item)}>
                                <FontAwesomeIcon icon={["fas", "hand-holding-medical"]} style={{color: "#ffffff"}} className="pr-2"/>
                                Request Item
                            </button>
                        </td>
                    </tr>
                ))}
            </table>
            {isModalOpen && (
                <Modal>
                    <div className="w-full flex justify-end">
                        <button className="hover:cursor-pointer" onClick={() => setIsModalOpen(false)}>
                            <FontAwesomeIcon icon={["fas", "x"]}/>
                        </button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Request Item</h1>
                        <p className="text-sm">Here are the items that are going to be borrowed:</p>
                        <div className="mt-4 flex flex-col gap-y-2">
                            <div className="flex flex-col">
                                <label htmlFor="Name">Name</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={requesteditem.Particular.Name} disabled/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Batch Number</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={requesteditem.BatchNumber} disabled/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Unit </label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={requesteditem.Particular.Unit} disabled/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Unit Cost</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={requesteditem.UnitCost} disabled/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Quantity</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={requesteditem.Quantity} disabled/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Expiry Date</label>
                                <input type="date" className="bg-gray-100 p-2 border w-88" value={new Date(requesteditem.ExpiryDate).toISOString().split("T")[0]} disabled/>
                            </div>
                            <button className="bg-gray-300 py-2 hover:cursor-pointer">Request Item</button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardTemplate>
    );
}

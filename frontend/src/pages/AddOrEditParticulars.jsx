import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import Modal from "../components/Modal.jsx"
import {useEffect, useState} from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

export default function AddOrEditParticulars() {
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    library.add(fas)

    const [particularName, setParticularName] = useState('')
    const [batchNumber, setBatchNumber] = useState('')
    const [unitCost, setUnitCost] = useState('')
    const [Quantity, setQuantity] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [remarks, setRemarks] = useState('')

    const BASE_URL = 'http://localhost:3000';

    const getInventory = async (particularTerm = "") => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                params: {
                    particularSearch: particularTerm
                },
                withCredentials: true
            });
            return res.data; // ✅ return just the data, not the whole response object
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err; // optional, to handle it in your component
        }
    };

    const openAddExistingItem = (item) => {
        setParticularName(item.Particular.Name)
        setRemarks((item.Remarks))
        setIsModalOpen(true)
    }

    const openAddNewItem = () => {
        setParticularName('')
        setRemarks('')
        setIsModalOpen(true)
    }


    useEffect(() => {
        getInventory(searchParticularTerm)
            .then(data => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, [searchParticularTerm]);

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-xs">If you're adding an existing item, search for it and click the plus button on its right side. If it does not exist, click the Add New Item button</p>
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search Particular"
                    value={searchParticularTerm}
                    onChange={(e) => setSearchParticularTerm(e.target.value)}
                    className="border my-4 px-2 py-1 w-72"
                />
                <button className="bg-green-500 border rounded-md p-1 hover:cursor-pointer h-10 w-48 text-white" onClick={() => openAddNewItem()}>
                    <FontAwesomeIcon icon={["fas", "plus"]} style={{color: "#ffffff"}} className="pr-2"/>
                    Add New Item
                </button>
            </div>

            <table className="mt-4 w-full">
                <tr className="border border-collapse">
                    <th className="px-2 border border-collapse text-center">Particulars</th>
                    <th className="px-2 border border-collapse text-center">Batch Number</th>
                </tr>
                {inventory.map((item) => (
                    <tr>
                    <td className="pr-2 border border-collapse">{item.Particular.Name}</td>
                        <td className="pr-2 border border-collapse text-center">{item.BatchNumber}</td>
                        <td className="p-2 border border-collapse text-center">
                            <button
                                className="bg-green-500 rounded-md p-1 hover:cursor-pointer"
                                onClick={() => openAddExistingItem(item)}
                            >
                                <FontAwesomeIcon icon={["fas", "plus"]} style={{color: "#ffffff"}}/>
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
                        <h3 className="text-2xl font-bold text-center">Add Particular</h3>
                        <div className="mt-4 flex flex-col gap-y-2">
                            <div className="flex flex-col">
                                <label htmlFor="Name">Name</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., M53 Cleanser, 1L" value={particularName} onChange={(e) => setParticularName(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Batch Number</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., NNO-123" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Unit Cost</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., 18000" onChange={(e) => setUnitCost(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Quantity</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., 12" onChange={(e) => setQuantity(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Expiry Date</label>
                                <input type="date" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., 18000" onChange={(e) => setExpiryDate(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Remarks</label>
                                <textarea className="bg-gray-100 p-2 border w-88" value={remarks} rows="4" cols="100" placeholder="Enter Remarks..." onChange={(e) => setRemarks(e.target.value)}></textarea>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardTemplate>
    );
}

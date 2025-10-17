import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import Modal from "../components/Modal.jsx"
import {useContext, useEffect, useState} from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {AuthContext} from "../contexts/AuthContext.jsx";

export default function AddOrEditParticulars() {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    library.add(fas)

    const [procurementId, setProcurementId] = useState('')
    const [particularName, setParticularName] = useState('')
    const [batchNumber, setBatchNumber] = useState('')
    const [unit, setUnit] = useState('')
    const [unitCost, setUnitCost] = useState('')
    const [Quantity, setQuantity] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [remarks, setRemarks] = useState('')

    const [modalTitle, setModalTitle] = useState('')

    const BASE_URL = 'http://localhost:3000';

    const getInventory = async (particularTerm = "") => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory`, {
                params: {
                    particularSearch: particularTerm
                },
                withCredentials: true
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            throw err; // optional, to handle it in your component
        }
    };

    const openAddExistingItem = (item) => {
        setModalTitle('Add Item')
        setParticularName(item.ParticularName)
        setBatchNumber('')
        setUnit('')
        setUnitCost('')
        setQuantity('')
        setExpiryDate('')
        setRemarks(item.Remarks)
        setIsModalOpen(true)
    }
    const openAddNewItem = () => {
        setModalTitle('Add Item')
        setParticularName('')
        setBatchNumber('')
        setUnit('')
        setUnitCost('')
        setQuantity('')
        setExpiryDate('')
        setRemarks('')
        setIsModalOpen(true)
    }

    const editItem = (item) => {
        setModalTitle('Edit Item')
        setProcurementId(item.Id)
        setParticularName(item.ParticularName)
        setBatchNumber(item.BatchNumber)
        setUnit(item.Unit)
        setUnitCost(item.UnitCost)
        setQuantity(item.RemainingQuantity)
        setExpiryDate(new Date(item.ExpiryDate).toISOString().split("T")[0])
        setRemarks((item.Remarks))
        setIsModalOpen(true)
    }

    const addItem = () => {
        const postData = {
            Name: particularName,
            Unit: unit,
            BatchNumber: batchNumber,
            UnitCost: unitCost,
            Quantity: Quantity,
            ExpiryDate: expiryDate,
            Remarks: remarks,
            ReceivingUser: user.Id,
            DateReceived: new Date()
        }
        axios.post(`${BASE_URL}/inventory/addItem`, postData)
            .then(response => {
                console.log('Response:', response.data);
                setIsModalOpen(false)
                window.location.reload()
                return response.data
            })
            .catch(error => {
                alert(`Error: ${error}`);
            });
    }

    const updateItem = (id) => {
        const postData = {
            Name: particularName,
            Unit: unit,
            BatchNumber: batchNumber,
            UnitCost: unitCost,
            Quantity: Quantity,
            ExpiryDate: expiryDate,
            Remarks: remarks,
            ReceivingUser: user.Id,
            DateReceived: new Date()
        }
        axios.post(`${BASE_URL}/inventory/updateItem/${id}`, postData)
            .then(response => {
                console.log('Response:', response.data);
                setIsModalOpen(false)
                window.location.reload()
                return response.data
            })
            .catch(error => {
                alert(`Error: ${error}`);
            });
    }

    useEffect(() => {
        getInventory(searchParticularTerm)
            .then(data => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, [searchParticularTerm]);

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Add/Edit Particulars</h1>
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
                    <th className="w-20"></th>
                </tr>
                {inventory.map((item) => (
                    <tr>
                    <td className="pr-2 border border-collapse">{item.ParticularName}</td>
                        <td className="pr-2 border border-collapse text-center">{item.BatchNumber}</td>
                        <td className="p-2 border border-collapse text-center flex justify-between w-20">
                            <button
                                className="bg-green-500 rounded-md p-1 hover:cursor-pointer"
                                onClick={() => openAddExistingItem(item)}
                            >
                                <FontAwesomeIcon icon={["fas", "plus"]} style={{color: "#ffffff"}}/>
                            </button>
                            <button
                                className="bg-blue-500 rounded-md p-1 hover:cursor-pointer"
                                onClick={() => editItem(item)}
                            >
                                <FontAwesomeIcon icon={["fas", "pen-to-square"]} style={{color: "#ffffff"}}/>
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
                        <h3 className="text-2xl font-bold text-center">{modalTitle}</h3>
                        <div className="mt-4 flex flex-col gap-y-2">
                            <div className="flex flex-col">
                                <label htmlFor="Name">Name</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., M53 Cleanser, 1L" value={particularName}
                                       onChange={(e) => setParticularName(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Batch Number</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88"
                                       placeholder="e.g., NNO-123" value={batchNumber}
                                       onChange={(e) => setBatchNumber(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Unit </label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={unit}
                                       placeholder="e.g., bx" onChange={(e) => setUnit(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Unit Cost</label>
                                <input type="text" className="bg-gray-100 p-2 border w-88" value={unitCost}
                                       placeholder="e.g., 18000" onChange={(e) => setUnitCost(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Expiry Date</label>
                                <input type="date" className="bg-gray-100 p-2 border w-88" value={expiryDate}
                                       placeholder="e.g., 18000" onChange={(e) => setExpiryDate(e.target.value)}/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="Name">Remarks</label>
                                <textarea className="bg-gray-100 p-2 border w-88" value={remarks} rows="4" cols="100"
                                          placeholder="Enter Remarks..."
                                          onChange={(e) => setRemarks(e.target.value)}></textarea>
                            </div>
                            <button className="bg-gray-300 py-2 hover:cursor-pointer" onClick={() => modalTitle === "Add Item" ? addItem() : updateItem(procurementId)}>
                                {modalTitle}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardTemplate>
    );
}

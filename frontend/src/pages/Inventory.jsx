import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";
import axios from 'axios'

export default function Inventory() {
    const { user, logout } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [searchParticularTerm, setSearchParticularTerm] = useState("")
    const [searchBatchNumber, setSearchBatchNumber] = useState("")

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

    useEffect(() => {
        getInventory(searchParticularTerm, searchBatchNumber)
            .then(data => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, [searchParticularTerm, searchBatchNumber]);

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Inventory</h1>

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
                    <th className="px-2 border border-collapse text-center">Expiry Date (YYYY-MM-DD)</th>
                </tr>
                {inventory.map((item) => (
                    <tr>
                    <td className="pr-2 border border-collapse ">{item.ParticularName}</td>
                        <td className="pr-2 border border-collapse text-center">{item.BatchNumber}</td>
                        <td className="pr-2 border border-collapse text-center">{item.RemainingQuantity}</td>
                        <td className="pr-2 border border-collapse text-center">{item.ExpiryDate
                                ? new Date(item.ExpiryDate).toLocaleDateString("en-CA") // en-CA gives yyyy-mm-dd
                                : ""}</td>
                    </tr>
                ))}
            </table>
        </DashboardTemplate>
    );
}

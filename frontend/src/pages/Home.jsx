import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";
import {useEffect, useState} from "react";

export default function Home() {
    const [inventory, setInventory] = useState([])

    const BASE_URL = 'http://localhost:3000';

    const lowStockItems = async() => {
        try {
            const res = await axios.get(`${BASE_URL}/inventory/lowItems`);
            return res.data;
        } catch (err) {
            console.error("Failed to fetch items:", err);
            throw err; // optional, to handle it in your component
        }
    }

    useEffect(() => {
        lowStockItems()
            .then(data => setInventory(data))
            .catch(() => alert("Failed to load inventory"));
    }, []);
    

    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {inventory.length === 0 && (
                <p>All items are in stock</p>
            )}
            {inventory.length >= 0 && (
                <>
                    <div className="border-solid border-[3px] border-red-600 bg-red-50 w-full h-24 my-6 p-4 rounded-md">
                        <div className="flex items-center">
                            <FontAwesomeIcon
                                icon={["fas", "circle-exclamation"]}
                                style={{color: "#ff0000", width: "2rem", height: "auto"}}
                                className="pr-2"
                            />
                            <h1 className="font-bold text-xl text-red-600">Warning</h1>
                        </div>
                        <p className="text-red-800">There are {inventory.length} items that are low or out of stock.</p>
                    </div>
                    <h1 className="text-xl font-bold">Low Stock Items</h1>
                    <table className="mt-4 w-full">
                        <tr className="border border-collapse">
                            <th className="px-2 border border-collapse text-center">Particular</th>
                            <th className="px-2 border border-collapse text-center">Stock</th>
                        </tr>
                        {inventory.map((data) => (
                            <tr>
                                <td className="px-2 border border-collapse">{data.Name}</td>
                                <td className="px-2 border border-collapse text-center">{Number(data.Qty)}</td>
                            </tr>
                        ))}
                    </table>
                </>
            )}
        </DashboardTemplate>
    );
}

import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useEffect, useState} from "react";
import axios from "axios";

export default function GenerateReport() {
    const [yearChoices, setYearChoices] = useState([])
    const [year, setYear] = useState('')
    const [quarter, setQuarter] = useState('')

    const generateReport = async () => {
        if (!year || !quarter) {
            alert("Please select a year and quarter.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:3000/inventory/report",
                { year, quarter },
                {
                    responseType: "blob", // ⚠️ important to handle file data
                    withCredentials: true,
                }
            );

            // ✅ Create a downloadable file
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `inventory_${year}_${quarter}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error("Error generating report:", err);
            alert("Failed to generate report");
        }
    };

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await axios.get("http://localhost:3000/inventory/years");
                setYearChoices(res.data);
            } catch (err) {
                console.error("Failed to fetch years:", err);
            }
        };

        fetchYears();
    }, []);
    
    return (
        <DashboardTemplate>
            <h1 className="text-3xl font-bold">Generate Report</h1>
            <p className="text-sm">Select a year and a quarter to generate the report for those.</p>
            <div className="my-3">
                <label htmlFor="year">Year</label><br/>
                <select name="year" id="year" className="bg-gray-200 p-2 mb-2" onChange={(e) => setYear(e.target.value)}>
                    <option value="" selected disabled>Choose Year</option>
                    {yearChoices.map((year) => (
                        <option value={year}>{year}</option>
                    ))}
                </select><br/>
                <label htmlFor="quarter">Quarter</label><br/>
                <select name="quarter" id="quarter" className="bg-gray-200 p-2 mb-2" onChange={(e) => setQuarter(e.target.value)}>
                    <option value="" selected disabled>Choose Quarter</option>
                    <option value="Q1">1st</option>
                    <option value="Q2">2nd</option>
                    <option value="Q3">3rd</option>
                    <option value="Q4">4th</option>
                </select><br/>
                <button className="bg-gray-300 p-2 mt-3 hover:cursor-pointer"
                        onClick={generateReport}>
                    Generate Report
                </button>
            </div>
        </DashboardTemplate>
    );
}

import DashboardTemplate from "../templates/DashboardTemplate.jsx";
import {useEffect, useState} from "react";
import axios from "axios";

export default function GenerateReport() {
    const [yearChoices, setYearChoices] = useState([])
    const [year, setYear] = useState('')
    const [quarter, setQuarter] = useState('')

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
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                </select><br/>
                <button className="bg-gray-300 p-2 mt-3 hover:cursor-pointer"
                        onClick={() => {
                            console.log(year)
                            console.log(quarter)
                        }}>
                    Generate Report
                </button>
            </div>
        </DashboardTemplate>
    );
}

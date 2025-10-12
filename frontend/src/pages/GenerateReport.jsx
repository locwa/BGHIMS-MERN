import DashboardTemplate from "../templates/DashboardTemplate.jsx";

export default function Home() {
    const { user } = useAuth()
    return (
        <DashboardTemplate>
            <h1>Generate Report</h1>
            <h2>Welcome {user.name}!</h2>
        </DashboardTemplate>
    );
}

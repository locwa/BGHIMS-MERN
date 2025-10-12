import MenuBar from '../components/MenuBar.jsx'

export default function DashboardTemplate({children}) {
    return (
        <div className="flex">
            <MenuBar/>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}
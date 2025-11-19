import MenuBar from '../components/MenuBar.jsx'

export default function DashboardTemplate({children}) {
    return (
        <div className="flex h-[100vh]">
            <MenuBar/>
            <div className="p-6 overflow-y-scroll w-full">
                {children}
            </div>
        </div>
    )
}
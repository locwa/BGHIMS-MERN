import MenuBar from '../components/MenuBar.jsx'

export default function DashboardTemplate({children}) {
    return (
        <div className="flex">
            <MenuBar/>
            {children}
        </div>
    )
}
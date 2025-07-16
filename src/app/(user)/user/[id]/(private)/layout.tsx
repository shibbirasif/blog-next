import DashboardSidebar from "./DashboardSidebar";

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="flex">
            <DashboardSidebar />
            {children}
        </div>
    );
}
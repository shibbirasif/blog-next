import Topbar from "@/components/Topbar";

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Topbar />
            <main className="mt-16">
                {children}
            </main>
        </>
    );
}
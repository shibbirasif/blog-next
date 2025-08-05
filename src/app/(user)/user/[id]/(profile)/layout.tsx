import Topbar from "@/components/Topbar";

export default async function UserProfileLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="mt-16">
            <Topbar />
            <div className="flex">
                <main className="flex-1 flex items-center justify-center p-4 ma">
                    <div className="w-full max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
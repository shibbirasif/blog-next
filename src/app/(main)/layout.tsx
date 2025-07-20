import Topbar from "@/components/Topbar";

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Topbar />
            <main className="mt-17 min-h-screen text-gray-700 dark:text-gray-300">
                {/* <header><h1>Blogify your self</h1></header> */}
                <article> {children} </article>
            </main>
            <footer className="bg-gray-200">
                <h4>Footer goes here..</h4>
            </footer>
        </>
    )
}
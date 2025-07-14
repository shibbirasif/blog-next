import Topbar from "@/components/Topbar";

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Topbar />
            <main className="mt-17">
                <header><h1>Blogify your self</h1></header>
                <article> {children} </article>
                <aside>Sidebar goes here</aside>
            </main>
            <footer className="bg-gray-200">
                <h4>Footer goes here..</h4>
            </footer>
        </>
    )
}
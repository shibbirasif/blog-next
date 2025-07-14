export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <main>
            <article> {children} </article>
        </main>
    );
}
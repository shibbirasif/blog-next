import DashboardSidebar from '../DashboardSidebar';

export default function DashboardPage() {
    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Create New Article</h1>
                <p className="text-center text-gray-500">
                    Please select an article from the sidebar to view or edit.
                </p>
            </div>
        </main>
    );
}

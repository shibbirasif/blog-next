import { H1 } from "@/components/ui/Headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditProfileForm from "@/components/profile/EditProfileForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProfileEditPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
        redirect('/signin');
    }

    // Check if the user is accessing their own dashboard
    if (session.user.id !== id) {
        redirect('/404');
    }

    return (
        <>
            <H1 className='text-center'>Start Writing</H1>
            <p className="text-center text-gray-500 mb-5">
                Share your thoughts and ideas with the world {session.user.name}.
            </p>
            <EditProfileForm />
        </>
    );

}
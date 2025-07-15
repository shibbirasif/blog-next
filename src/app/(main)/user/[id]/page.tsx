import { userService } from '@/services/userService';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface UserProfilePageProps {
    params: {
        id: string;
    };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const { id } = params;

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            notFound();
        }

        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
                        <div className="absolute -bottom-16 left-6">
                            <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={`${user.name}'s avatar`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 pb-6 px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {user.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {user.email}
                                </p>

                                {/* User Status */}
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>

                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isEmailVerified
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                        {user.isEmailVerified ? 'Email Verified' : 'Email Pending'}
                                    </span>
                                </div>

                                {/* User Roles */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {user.roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        {user.bio && (
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    About
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        {/* Join Date */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Member since:</span>{' '}
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading user profile:', error);
        notFound();
    }
}

// Generate metadata for the page
export async function generateMetadata({ params }: UserProfilePageProps) {
    const { id } = params;

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return {
                title: 'User Not Found',
                description: 'The requested user profile could not be found.'
            };
        }

        return {
            title: `${user.name} - User Profile`,
            description: user.bio || `View ${user.name}'s profile and activity on our blog platform.`,
        };
    } catch (error) {
        return {
            title: 'User Profile',
            description: 'User profile page'
        };
    }
}

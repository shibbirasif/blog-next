import { auth } from "@/lib/auth";
import { userService } from "@/services/userService";
import { ProfileEditInput, profileEditSchema } from "@/validations/profileEdit";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const user = await userService.getUserById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        } else {
            return NextResponse.json(user);
        }

    } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.id !== id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const body = await request.formData();
        const requestData = {
            name: body.get('name')?.toString() || '',
            bio: body.get('bio')?.toString() || '',
            avatar: body.get('avatar') ? (body.get('avatar') as File) : undefined,
            uploadedFileIds: body.get('uploadedFileIds') ? JSON.parse(body.get('uploadedFileIds') as string) : []
        } as ProfileEditInput;

        const validationResult = profileEditSchema.safeParse(requestData);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request data', issues: validationResult.error.issues },
                { status: 400 }
            );
        }
        const profileData = validationResult.data;
        const updatedUser = await userService.updateUser(id, {
            name: profileData.name,
            bio: profileData.bio,
            uploadedFileIds: profileData.uploadedFileIds
        });


        return NextResponse.json({
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
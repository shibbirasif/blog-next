import { auth } from "@/lib/auth";
import { userService } from "@/services/userService";
import { profileEditSchema } from "@/validations/profileEdit";
import { NextRequest, NextResponse } from "next/server";
import { uploadedFileService } from "@/services/UploadedFileService";
import { FileType, AttachableType } from "@/models/UploadedFile";

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

        const validationResult = profileEditSchema.safeParse({
            name: body.get('name')?.toString() || '',
            bio: body.get('bio')?.toString() || '',
            avatar: body.get('avatar') ? (body.get('avatar') as File) : undefined,
            uploadedFileIds: body.get('uploadedFileIds') ? JSON.parse(body.get('uploadedFileIds') as string) : []
        });

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request data', issues: validationResult.error.issues },
                { status: 400 }
            );
        }
        const profileData = validationResult.data;
        console.log("Profile data to update:", profileData.avatar !== undefined ? "Has avatar" : "No avatar");

        const updateData: any = {
            name: profileData.name,
            bio: profileData.bio,
        }

        if (profileData.avatar) {
            const oldAvatars = await uploadedFileService.findUserAvatars(id);
            oldAvatars.forEach(async (file) => {
                await uploadedFileService.deleteFile(file.id);
            });

            const avatar = await uploadedFileService.uploadFile({
                file: profileData.avatar,
                altText: `Avatar for user ${id}`,
                fileType: FileType.IMAGE,
                uploadedBy: id,
                attachableType: AttachableType.USER_AVATAR,
                attachableId: id
            });
            updateData.avatar = avatar.id;
        }

        const updatedUser = await userService.updateUser(id, updateData);

        if (profileData.uploadedFileIds && profileData.uploadedFileIds.length > 0) {
            await uploadedFileService.attachAllToEntity(profileData.uploadedFileIds, AttachableType.USER_BIO, id, session.user.id);
        }

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
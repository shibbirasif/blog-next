import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadedFileService } from '@/services/uploadedFileService';
import { fileUploadSchema } from '@/validations/fileUpload';
import { getUploadedFileUrl } from '@/utils/fileUpload';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const altText = formData.get('altText') as (string | null | undefined);

        // Validate input using Zod
        const validationResult = fileUploadSchema.safeParse({
            file,
            altText: altText ?? undefined,
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        const uploadedFile = await uploadedFileService.uploadFile({
            file: validatedData.file,
            altText: validatedData.altText || '',
            uploadedBy: session.user.id
        });

        return NextResponse.json({
            message: 'File uploaded successfully',
            file: {
                id: uploadedFile.id,
                filename: uploadedFile.filename,
                originalName: uploadedFile.originalName,
                url: getUploadedFileUrl({ id: uploadedFile.id, url: uploadedFile.url }),
                altText: uploadedFile.altText,
                size: uploadedFile.size,
                mimeType: uploadedFile.mimeType,
                status: uploadedFile.status
            }
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

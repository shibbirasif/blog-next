import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadedFileService } from '@/services/UploadedFileService';
import { AttachableType, FileType } from '@/models/UploadedFile';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { PRIVATE_UPLOAD_DIR } from '@/constants/uploads';
import { uploadFileSchema } from '@/validations/upload';
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
        const altText = formData.get('altText') as string;
        const articleId = formData.get('articleId') as string;

        // Validate input using Zod
        const validationResult = uploadFileSchema.safeParse({
            file,
            altText,
            articleId
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

        const bytes = await validatedData.file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const checksum = crypto.createHash('md5').update(buffer).digest('hex');

        const fileExtension = validatedData.file.name.split('.').pop();
        const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

        const fileData = {
            filename: uniqueFilename,
            originalName: validatedData.file.name,
            altText: validatedData.altText || '',
            fileType: FileType.IMAGE,
            mimeType: validatedData.file.type,
            size: validatedData.file.size,
            path: '',
            url: '',
            checksum,
            uploadedBy: session.user.id,
            attachableType: validatedData.articleId ? AttachableType.ARTICLE : undefined,
            attachableId: validatedData.articleId || undefined,
        };

        const uploadedFile = await uploadedFileService.uploadFile(fileData);

        const fileDir = join(PRIVATE_UPLOAD_DIR, uploadedFile.id);
        await mkdir(fileDir, { recursive: true });

        const filePath = join(fileDir, uniqueFilename);
        await writeFile(filePath, buffer);

        const fileUrl = getUploadedFileUrl(uploadedFile);

        const updatedFile = await uploadedFileService.updateFilePathAndUrl(
            uploadedFile.id,
            filePath,
            fileUrl
        );

        if (!updatedFile) {
            throw new Error('Failed to update file record');
        }

        return NextResponse.json({
            message: 'File uploaded successfully',
            file: {
                id: updatedFile.id,
                filename: updatedFile.filename,
                originalName: updatedFile.originalName,
                url: updatedFile.url,
                altText: updatedFile.altText,
                size: updatedFile.size,
                mimeType: updatedFile.mimeType,
                status: updatedFile.status
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

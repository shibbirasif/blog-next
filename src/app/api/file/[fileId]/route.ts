import { NextRequest, NextResponse } from 'next/server';
import { uploadedFileService } from '@/services/UploadedFileService';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PRIVATE_UPLOAD_DIR } from '@/constants/uploads';

export async function GET(
    request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const { fileId } = params;

        const fileRecord = await uploadedFileService.findFile(fileId);

        if (!fileRecord || !fileRecord.path || !fileRecord.url) {
            return NextResponse.json(
                { error: 'File not found or incomplete metadata' },
                { status: 404 }
            );
        }
        // Check for placeholder values
        if (fileRecord.path === 'pending' || fileRecord.url === 'pending') {
            return NextResponse.json(
                { error: 'File not ready yet' },
                { status: 404 }
            );
        }

        try {
            // Read file from private directory
            const filePath = join(PRIVATE_UPLOAD_DIR, fileId, fileRecord.filename);
            if (!filePath || typeof filePath !== 'string') {
                return NextResponse.json(
                    { error: 'File path missing or invalid' },
                    { status: 404 }
                );
            }
            const fileBuffer = await readFile(filePath);

            // Set appropriate headers
            const headers = new Headers();
            headers.set('Content-Type', fileRecord.mimeType);
            headers.set('Content-Length', fileRecord.size.toString());
            headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            headers.set('ETag', `"${fileRecord.checksum}"`);

            // Set Content-Disposition for better file handling
            headers.set('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);

            // Same-origin security headers (social media friendly)
            headers.set('X-Frame-Options', 'SAMEORIGIN'); // Still prevent iframe embedding
            headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Allow referrer for HTTPS cross-origin
            headers.set('X-Content-Type-Options', 'nosniff');

            // Allow social media and search engines to access images
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET');
            headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

            // Check if client has cached version
            const ifNoneMatch = request.headers.get('if-none-match');
            if (ifNoneMatch && ifNoneMatch.includes(fileRecord.checksum)) {
                return new NextResponse(null, { status: 304, headers });
            }

            return new NextResponse(fileBuffer, {
                status: 200,
                headers
            });

        } catch (fileError) {
            console.error('Error reading file:', fileError);
            return NextResponse.json(
                { error: 'File not accessible' },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('File serving error:', error);
        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        );
    }
}
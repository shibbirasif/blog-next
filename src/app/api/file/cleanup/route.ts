import { NextRequest, NextResponse } from 'next/server';
import { uploadedFileService } from '@/services/UploadedFileService';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PRIVATE_UPLOAD_DIR } from '@/constants/uploads';

// Helper: get date 24 hours ago
function get24HoursAgo() {
    const now = new Date();
    now.setHours(now.getHours() - 24);
    return now;
}

export async function DELETE(request: NextRequest) {
    try {
        // Find orphaned files older than 24 hours
        // You may need to implement findOrphanedFiles in UploadedFileService
        const orphanedFiles = await uploadedFileService.findOrphanedFiles(get24HoursAgo());

        let deleted = [];
        let failed = [];

        for (const file of orphanedFiles) {
            try {
                // Remove file from local disk if url is local
                if (file.url && file.url.startsWith('/api/file/')) {
                    const filePath = join(PRIVATE_UPLOAD_DIR, file.id, file.filename);
                    await unlink(filePath);
                } else if (file.url && file.url.startsWith('https://')) {
                    // await deleteFromCloud(file.url)
                }
                
                await uploadedFileService.deleteFile(file.id);
                deleted.push(file.id);
            } catch (err) {
                failed.push({ id: file.id, error: err instanceof Error ? err.message : String(err) });
            }
        }

        return NextResponse.json({
            message: 'Orphaned files cleanup complete',
            deleted,
            failed
        });
    } catch (error) {
        console.error('Orphaned file cleanup error:', error);
        return NextResponse.json(
            { error: 'Failed to cleanup orphaned files' },
            { status: 500 }
        );
    }
}

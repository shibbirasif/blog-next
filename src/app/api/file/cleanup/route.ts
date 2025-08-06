import { NextResponse } from 'next/server';
import { uploadedFileService } from '@/services/UploadedFileService';

function get24HoursAgo() {
    const now = new Date();
    now.setHours(now.getHours() - 24);
    return now;
}

export async function DELETE() {
    try {
        // Find orphaned files older than 24 hours
        // You may need to implement findOrphanedFiles in UploadedFileService
        const orphanedFiles = await uploadedFileService.findOrphanedFiles(get24HoursAgo());

        const deleted = [];
        const failed = [];

        for (const file of orphanedFiles) {
            try {
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

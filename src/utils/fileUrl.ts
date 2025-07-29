import type { UploadedFileDto } from '@/dtos/UploadedFileDto';

export function getUploadedFileUrl(file: UploadedFileDto): string {
    // If file.url is set (e.g. by cloud upload), use it
    if (file.url && file.url.startsWith('http')) {
        return file.url;
    }
    // Otherwise, use local API route
    return `/api/file/${file.id}`;
}

import type { UploadedFileDto } from '@/dtos/UploadedFileDto';

/**
 * Delete a file from cloud storage by its URL.
 * Implement provider-specific logic here (e.g., AWS S3, GCS, etc.)
 */
export async function deleteFromCloud(url: string): Promise<void> {
    // Example: AWS S3 deletion using SDK
    // if (url.startsWith('https://your-s3-bucket.s3.amazonaws.com/')) {
    //     const s3Key = url.split('your-s3-bucket.s3.amazonaws.com/')[1];
    //     await s3.deleteObject({ Bucket: 'your-s3-bucket', Key: s3Key }).promise();
    //     return;
    // }

    // Example: Google Cloud Storage deletion
    // if (url.startsWith('https://storage.googleapis.com/your-gcs-bucket/')) {
    //     const gcsKey = url.split('your-gcs-bucket/')[1];
    //     await gcs.bucket('your-gcs-bucket').file(gcsKey).delete();
    //     return;
    // }

    // Add other providers as needed
    throw new Error('Cloud deletion not implemented for this URL: ' + url);
}

export function getUploadedFileUrl(file: UploadedFileDto): string {
    // If file.url is set (e.g. by cloud upload), use it
    if (file.url && file.url.startsWith('http')) {
        return file.url;
    }
    // Otherwise, use local API route
    return `/api/file/${file.id}`;
}

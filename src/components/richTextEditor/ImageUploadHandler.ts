export interface ImageUploadResult {
    success: boolean;
    src?: string;
    uploadedFileId?: string;
    error?: string;
}

export class ImageUploadHandler {
    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static readonly ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    static validateFile(file: File): { valid: boolean; error?: string } {
        if (!this.ACCEPTED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
            };
        }

        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: 'Image file size must be less than 5MB'
            };
        }

        return { valid: true };
    }

    // Convert file to base64 for immediate display (temporary solution)
    static async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static async uploadToServer(file: File, uploadUrl: string, altText: string): Promise<ImageUploadResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('altText', altText);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Expecting { file: { url, id, ... } }
            return {
                success: true,
                src: data.file.url,
                uploadedFileId: data.file.id
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

}

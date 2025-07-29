export interface ImageUploadResult {
    success: boolean;
    url?: string;
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

    // Upload to server (you can implement your preferred upload method)
    static async uploadToServer(file: File): Promise<ImageUploadResult> {
        try {
            // For now, we'll use base64 encoding
            // In production, you'd upload to your server/cloud storage
            const base64 = await this.fileToBase64(file);

            return {
                success: true,
                url: base64
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    // Alternative: Upload to cloud storage (implement as needed)
    static async uploadToCloudStorage(file: File): Promise<ImageUploadResult> {
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Example API call - replace with your actual upload endpoint
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            return {
                success: true,
                url: data.url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }
}

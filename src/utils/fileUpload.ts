import type { UploadedFileDto } from '@/dtos/UploadedFileDto';
import { v2 as cloudinary } from 'cloudinary';
import { PRIVATE_UPLOAD_DIR } from '@/constants/uploads';
import { join } from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import crypto from 'crypto';
import { FileType } from '@/models/UploadedFile';


interface FileUploadConfig {
    storageType: 'cloudinary' | 'local';
    cloudinaryConfig?: {
        cloud_name: string;
        api_key: string;
        api_secret: string;
    };
    localStoragePath: string;
}

interface FileUploadData {
    filename: string;
    originalName: string;
    fileType: FileType;
    mimeType: string;
    size: number;
    checksum: string;
    url: string;
}

const config: FileUploadConfig = {
    storageType: process.env.STORAGE_TYPE as 'cloudinary' | 'local' || 'local',
    cloudinaryConfig: process.env.STORAGE_TYPE === 'cloudinary' ? {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
        api_key: process.env.CLOUDINARY_API_KEY || '',
        api_secret: process.env.CLOUDINARY_API_SECRET || ''
    } : undefined,
    localStoragePath: PRIVATE_UPLOAD_DIR
};

if (config.storageType === 'cloudinary' && config.cloudinaryConfig) {
    cloudinary.config(config.cloudinaryConfig);
}

function getCloudinaryResourceType(type?: FileType): 'image' | 'video' | 'raw' {
    switch (type) {
        case FileType.IMAGE:
            return 'image';
        case FileType.VIDEO:
            return 'video';
        default:
            return 'raw';
    }
}

export function getFileType(file: File): FileType {
    const mime = file.type;

    if (mime.startsWith('image/')) {
        return FileType.IMAGE;
    }

    if (mime.startsWith('video/')) {
        return FileType.VIDEO;
    }

    if (mime === 'application/pdf') {
        return FileType.PDF;
    }

    if (mime === 'application/msword' ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime === 'application/vnd.oasis.opendocument.text') {
        return FileType.DOCUMENT;
    }

    if (mime.startsWith('audio/')) {
        return FileType.AUDIO;
    }

    if (mime === '' || mime === 'application/octet-stream') {
        return FileType.DOCUMENT;
    }

    return FileType.DOCUMENT;
}

export async function uploadFile(file: File): Promise<FileUploadData>{
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const checksum = crypto.createHash('md5').update(buffer).digest('hex');

        const dotIndex = file.name.lastIndexOf('.');
        const fileName = dotIndex > 0 ? file.name.substring(0, dotIndex) : file.name;
        const fileExtension = dotIndex > 0 ? file.name.substring(dotIndex + 1) : '';
        const uniqueFilename = `${fileName}-${crypto.randomUUID()}${fileExtension ? '.' + fileExtension : ''}`;

        const fileType = getFileType(file);

        let url = '';

        if (config.storageType === 'cloudinary') {
            url = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        public_id: uniqueFilename,
                        resource_type: getCloudinaryResourceType(fileType),
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        } else {
                            return resolve(result?.secure_url || '');
                        }
                    }
                ).end(buffer);
            });
        } else {
            await mkdir(config.localStoragePath, { recursive: true });
            const filePath = join(config.localStoragePath, uniqueFilename);
            await writeFile(filePath, buffer);
            url = `${config.localStoragePath}/${uniqueFilename}`;
        }
        return {
            filename: uniqueFilename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            checksum,
            url,
            fileType
        };
    } catch (error) {
        throw error instanceof Error ? error : new Error('Unknown error during file upload');
    }
}

export async function deleteFile(fileName: string, fileType: FileType = FileType.IMAGE): Promise<void> {
    try {
        if (config.storageType === 'cloudinary') {
            await cloudinary.uploader.destroy(fileName, {
                resource_type: getCloudinaryResourceType(fileType)
            });
        } else {
            const filePath = join(config.localStoragePath!, fileName);
            await unlink(filePath);
        }
    } catch (error) {
        throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function getUploadedFileUrl(file: Pick<UploadedFileDto, 'id' | 'url'>): string {
    if (file.url && file.url.startsWith('http')) {
        return file.url;
    }
    return `/api/file/${file.id}`;
}

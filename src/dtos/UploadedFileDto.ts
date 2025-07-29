import { FileType, AttachableType, FileStatus } from '../models/UploadedFile';
import type { IUploadedFile } from '../models/UploadedFile';

export interface UploadedFileDto {
    id: string;
    filename: string;
    originalName: string;
    altText?: string;
    fileType: FileType;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    checksum: string;
    attachableType: AttachableType | null;
    attachableId: string | null;
    uploadedBy: {
        id: string;
        name?: string;
        email?: string;
    };
    status: FileStatus;
    metadata?: Record<string, any>[];
    uploadedAt: Date;
    updatedAt: Date;
}

export function buildUploadedFileDto(file: IUploadedFile): UploadedFileDto {
    return {
        id: (file._id as any).toString(),
        filename: file.filename,
        originalName: file.originalName,
        altText: file.altText,
        fileType: file.fileType,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        url: file.url,
        checksum: file.checksum,
        attachableType: file.attachableType,
        attachableId: file.attachableId?.toString() || null,
        uploadedBy: {
            id: file.uploadedBy._id?.toString() || file.uploadedBy.toString(),
            name: (file.uploadedBy as any).name,
            email: (file.uploadedBy as any).email
        },
        status: file.status,
        metadata: file.metadata,
        uploadedAt: file.uploadedAt,
        updatedAt: file.updatedAt
    };
}

export interface CreateUploadedFileDto {
    filename: string;
    originalName: string;
    altText?: string;
    fileType: FileType;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    checksum: string;
    uploadedBy: string;
    attachableType?: AttachableType;
    attachableId?: string;
    metadata?: Record<string, any>[];
}

export interface DeleteFilesResultDto {
    deleted: number;
    failed: string[];
}

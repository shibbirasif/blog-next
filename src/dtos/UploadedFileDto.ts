import mongoose from 'mongoose';
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
    url: string;
    checksum: string;
    attachableType: AttachableType | null;
    attachableId: string | null;
    uploadedBy: {
        id: string;
    };
    status: FileStatus;
    metadata?: Record<string, unknown>[];
    uploadedAt: Date;
    updatedAt: Date;
}

export function buildUploadedFileDto(file: IUploadedFile): UploadedFileDto {
    return {
        id: (file._id as mongoose.Types.ObjectId).toString(),
        filename: file.filename,
        originalName: file.originalName,
        altText: file.altText,
        fileType: file.fileType,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        checksum: file.checksum,
        attachableType: file.attachableType,
        attachableId: file.attachableId?.toString() || null,
        uploadedBy: {
            id: file.uploadedBy._id?.toString() || file.uploadedBy.toString(),
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
    metadata?: Record<string, unknown>[];
}

export interface DeleteFilesResultDto {
    deleted: number;
    failed: string[];
}

import UploadedFile, { AttachableType, FileStatus, IUploadedFile } from '../models/UploadedFile';
import { UploadedFileDto, buildUploadedFileDto } from '../dtos/UploadedFileDto';
import mongoose from 'mongoose';
import { deleteFile, uploadFile } from '@/utils/fileUpload';

interface uploadFileParams {
    file: File;
    altText: string;
    uploadedBy: string;
    attachableType?: AttachableType;
    attachableId?: string;
}

export class UploadedFileService {
    async uploadFile(data: uploadFileParams): Promise<UploadedFileDto> {
        try {
            const { file, altText = '', uploadedBy } = data;
            const {
                filename,
                originalName,
                mimeType,
                size,
                checksum,
                url,
                fileType
            } = await uploadFile(file);

            const uploadedFile = new UploadedFile({
                filename,
                originalName,
                altText,
                fileType,
                mimeType,
                size,
                checksum,
                uploadedBy,
                url,
                status: FileStatus.PERMANENT,
                attachableType: data.attachableType || null,
                attachableId: data.attachableId ? new mongoose.Types.ObjectId(data.attachableId) : null,
            }) as IUploadedFile;

            const savedFile = await uploadedFile.save();

            return buildUploadedFileDto(savedFile);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to upload file');
        }
    }

    async findUserAvatars(userId: string): Promise<UploadedFileDto[]> {
        try {
            const files = await UploadedFile.find({
                attachableId: userId,
                attachableType: AttachableType.USER_AVATAR,
            });

            return files.map(file => buildUploadedFileDto(file));
        } catch (error) {
            console.error('Error finding user avatars:', error);
            throw new Error('Failed to find user avatars');
        }
    }

    async deleteFile(fileId: string): Promise<boolean> {
        try {
            const file = await UploadedFile.findById(fileId);
            if (!file) {
                return false;
            }
            await deleteFile(file.filename);
            await file.delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    async findFile(fileId: string): Promise<UploadedFileDto | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(fileId)) {
                return null;
            }

            const file = await UploadedFile.findById(fileId);
            return file ? buildUploadedFileDto(file) : null;
        } catch (error) {
            console.error('Error finding file:', error);
            throw new Error('Failed to find file');
        }
    }


    async attachToEntity(
        fileId: string,
        entityType: AttachableType,
        entityId: string,
        userId?: string
    ): Promise<UploadedFileDto | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(fileId) || !mongoose.Types.ObjectId.isValid(entityId)) {
                return null;
            }

            const filter: {
                _id: string;
                uploadedBy?: mongoose.Types.ObjectId;
            } = { _id: fileId };

            if (userId) {
                filter.uploadedBy = new mongoose.Types.ObjectId(userId);
            }

            const file = await UploadedFile.findOne(filter);
            if (!file) {
                return null;
            }

            const updatedFile = await file.attachTo(entityType, entityId);
            return buildUploadedFileDto(updatedFile);
        } catch (error) {
            console.error('Error attaching file to entity:', error);
            throw new Error('Failed to attach file to entity');
        }
    }

    async attachAllToEntity(fileIds: string[], entityType: AttachableType, entityId: string, userId?: string): Promise<void> {
        if (fileIds.length > 0) {
            const attachPromises = fileIds.map(fileId =>
                uploadedFileService.attachToEntity(
                    fileId,
                    entityType,
                    entityId,
                    userId
                )
            );

            await Promise.all(attachPromises);
        }
    }

    async findOrphanedFiles(olderThan?: Date): Promise<UploadedFileDto[]> {
        try {
            const filter: Record<string, unknown> = {
                attachableType: null,
                attachableId: null,
                status: FileStatus.TEMPORARY
            };

            if (olderThan) {
                filter.uploadedAt = { $lt: olderThan };
            }

            const files = await UploadedFile.find(filter)
                .populate('uploadedBy', 'name email')
                .sort({ uploadedAt: -1 });

            return files.map(file => buildUploadedFileDto(file));
        } catch (error) {
            console.error('Error finding orphaned files:', error);
            throw new Error('Failed to find orphaned files');
        }
    }
}

export const uploadedFileService = new UploadedFileService();

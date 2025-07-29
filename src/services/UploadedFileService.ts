import UploadedFile, { IUploadedFile, FileType, AttachableType, FileStatus } from '../models/UploadedFile';
import {
    UploadedFileDto,
    buildUploadedFileDto,
    CreateUploadedFileDto,
    DeleteFilesResultDto
} from '../dtos/UploadedFileDto';
import mongoose from 'mongoose';

export class UploadedFileService {

    async uploadFile(data: CreateUploadedFileDto): Promise<UploadedFileDto> {
        try {
            const fileData = {
                ...data,
                uploadedBy: new mongoose.Types.ObjectId(data.uploadedBy),
                attachableId: data.attachableId ? new mongoose.Types.ObjectId(data.attachableId) : null,
                status: data.attachableType && data.attachableId ? FileStatus.PERMANENT : FileStatus.TEMPORARY
            };

            const uploadedFile = new UploadedFile(fileData);
            const savedFile = await uploadedFile.save();
            return buildUploadedFileDto(savedFile);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }
    }

    async findFile(fileId: string): Promise<UploadedFileDto | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(fileId)) {
                return null;
            }

            const file = await UploadedFile.findById(fileId).populate('uploadedBy', 'name email');
            return file ? buildUploadedFileDto(file) : null;
        } catch (error) {
            console.error('Error finding file:', error);
            throw new Error('Failed to find file');
        }
    }

    async deleteFiles(fileIds: string[], userId?: string): Promise<DeleteFilesResultDto> {
        try {
            const results = {
                deleted: 0,
                failed: [] as string[]
            };

            for (const fileId of fileIds) {
                try {
                    if (!mongoose.Types.ObjectId.isValid(fileId)) {
                        results.failed.push(fileId);
                        continue;
                    }

                    const filter: any = { _id: fileId };

                    if (userId) {
                        filter.uploadedBy = new mongoose.Types.ObjectId(userId);
                    }

                    const file = await UploadedFile.findOne(filter);
                    if (!file) {
                        results.failed.push(fileId);
                        continue;
                    }

                    file.status = FileStatus.ARCHIVED;
                    await file.save();
                    results.deleted++;
                } catch (error) {
                    results.failed.push(fileId);
                }
            }

            return results;
        } catch (error) {
            console.error('Error deleting files:', error);
            throw new Error('Failed to delete files');
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

            const filter: any = { _id: fileId };

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

    async getFilesByEntity(
        entityType: AttachableType,
        entityId: string
    ): Promise<UploadedFileDto[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(entityId)) {
                return [];
            }

            const files = await UploadedFile.find({
                attachableType: entityType,
                attachableId: new mongoose.Types.ObjectId(entityId),
                status: { $ne: FileStatus.ARCHIVED }
            })
                .populate('uploadedBy', 'name email')
                .sort({ uploadedAt: -1 });

            return files.map(file => buildUploadedFileDto(file));
        } catch (error) {
            console.error('Error getting files by entity:', error);
            throw new Error('Failed to get files by entity');
        }
    }

    async findOrphanedFiles(userId?: string): Promise<UploadedFileDto[]> {
        try {
            const filter: any = {
                attachableType: null,
                attachableId: null,
                status: FileStatus.TEMPORARY
            };

            if (userId) {
                filter.uploadedBy = new mongoose.Types.ObjectId(userId);
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

    async updateFilePathAndUrl(fileId: string, path: string, url: string): Promise<UploadedFileDto | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(fileId)) {
                return null;
            }

            const updatedFile = await UploadedFile.findByIdAndUpdate(
                fileId,
                { path, url },
                { new: true }
            ).populate('uploadedBy', 'name email');

            return updatedFile ? buildUploadedFileDto(updatedFile) : null;
        } catch (error) {
            console.error('Error updating file path and URL:', error);
            throw new Error('Failed to update file path and URL');
        }
    }
}

// Export singleton instance for IoC
export const uploadedFileService = new UploadedFileService();

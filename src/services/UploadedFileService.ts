import UploadedFile, { AttachableType, FileStatus } from '../models/UploadedFile';
import { UploadedFileDto, buildUploadedFileDto, CreateUploadedFileDto, DeleteFilesResultDto } from '../dtos/UploadedFileDto';
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

    async deleteFile(fileId: string): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(fileId)) {
                return false;
            }
            const file = await UploadedFile.findById(fileId);
            if (!file) {
                return false;
            }
            file.status = FileStatus.ARCHIVED;
            await file.save();
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

            const file = await UploadedFile.findById(fileId).populate('uploadedBy', 'name email');
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


    async findOrphanedFiles(olderThan?: Date): Promise<UploadedFileDto[]> {
        try {
            const filter: any = {
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

export const uploadedFileService = new UploadedFileService();

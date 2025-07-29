import mongoose, { Document, Schema, Model } from 'mongoose';

export enum FileType {
    IMAGE = 'image',
    PDF = 'pdf',
    DOCUMENT = 'document',
    VIDEO = 'video',
    AUDIO = 'audio'
}

export enum AttachableType {
    ARTICLE = 'Article',
    USER = 'User'
}

export enum FileStatus {
    TEMPORARY = 'temporary',
    PERMANENT = 'permanent',
    ARCHIVED = 'archived'
}

export interface IUploadedFile extends Document {
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
    attachableId: mongoose.Types.ObjectId | null;
    uploadedBy: mongoose.Types.ObjectId;
    status: FileStatus;
    metadata?: Record<string, any>[];
    uploadedAt: Date;
    updatedAt: Date;

    markAsPermanent(): Promise<IUploadedFile>;
    markAsArchived(): Promise<IUploadedFile>;
    attachTo(entityType: AttachableType, entityId: string): Promise<IUploadedFile>;
    detach(): Promise<IUploadedFile>;
}

const UploadedFileSchema = new Schema<IUploadedFile>({
    filename: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    originalName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    altText: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null
    },
    fileType: {
        type: String,
        enum: Object.values(FileType),
        required: true,
        index: true
    },
    mimeType: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    size: {
        type: Number,
        required: true,
        min: 0,
        max: 100 * 1024 * 1024
    },
    path: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 500
    },
    url: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    checksum: {
        type: String,
        required: true,
        trim: true,
        index: true,
        maxlength: 64
    },
    attachableType: {
        type: String,
        enum: Object.values(AttachableType),
        default: null,
        index: true
    },
    attachableId: {
        type: Schema.Types.ObjectId,
        default: null,
        index: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(FileStatus),
        default: FileStatus.TEMPORARY,
        index: true
    },
    metadata: {
        type: [Schema.Types.Mixed],
        default: []
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    collection: 'uploadedfiles'
});

UploadedFileSchema.index({ attachableType: 1, attachableId: 1 });
UploadedFileSchema.index({ uploadedBy: 1, status: 1 });
UploadedFileSchema.index({ status: 1, uploadedAt: 1 });
UploadedFileSchema.index({ fileType: 1, status: 1 });

UploadedFileSchema.methods.markAsPermanent = async function (): Promise<IUploadedFile> {
    this.status = FileStatus.PERMANENT;
    return await this.save();
};

UploadedFileSchema.methods.markAsArchived = async function (): Promise<IUploadedFile> {
    this.status = FileStatus.ARCHIVED;
    return await this.save();
};

UploadedFileSchema.methods.attachTo = async function (
    entityType: AttachableType,
    entityId: string
): Promise<IUploadedFile> {
    this.attachableType = entityType;
    this.attachableId = new mongoose.Types.ObjectId(entityId);
    this.status = FileStatus.PERMANENT;
    return await this.save();
};

UploadedFileSchema.methods.detach = async function (): Promise<IUploadedFile> {
    this.attachableType = null;
    this.attachableId = null;
    this.status = FileStatus.TEMPORARY;
    return await this.save();
};

UploadedFileSchema.pre('save', function (next) {
    if (this.attachableType && !this.attachableId) {
        return next(new Error('attachableId is required when attachableType is set'));
    }
    if (!this.attachableType && this.attachableId) {
        return next(new Error('attachableType is required when attachableId is set'));
    }

    if (this.attachableType && this.attachableId && this.status === FileStatus.TEMPORARY) {
        this.status = FileStatus.PERMANENT;
    }

    next();
});

const UploadedFile = mongoose.model<IUploadedFile>('UploadedFile', UploadedFileSchema);

export default UploadedFile;

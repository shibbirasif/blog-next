import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITag extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TagSchema = new Schema<ITag>({
    name: {
        type: String,
        required: [true, "Tag name is required"],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [2, "Tag name must be at least 2 characters long"],
        maxlength: [30, "Tag name cannot exceed 30 characters"],
        validate: {
            validator: function (name: string) {
                const tagPattern = /^[a-zA-Z0-9\-_\s]+$/;
                return tagPattern.test(name);
            },
            message: "Tag name can only contain letters, numbers, hyphens, underscores, and spaces"
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, "Tag description cannot exceed 200 characters"],
    },
    color: {
        type: String,
        trim: true,
        validate: {
            validator: function (color: string) {
                if (!color) return true;
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
            },
            message: "Color must be a valid hex color code (e.g., #FF5733 or #F53)"
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    }
}, {
    timestamps: true
});

TagSchema.index({ isActive: 1, name: 1 });

TagSchema.index({
    name: "text",
    description: "text"
});

const Tag: Model<ITag> = mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);
export default Tag;

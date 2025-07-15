import mongoose, { Schema, Document, Model } from "mongoose";
import Tag from "./Tag";

export interface IArticle extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    tags?: mongoose.Types.ObjectId[];
    isPublished: boolean;
    seriesId?: string;
    partNumber?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters long"],
        maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        minlength: [10, "Content must be at least 10 characters long"],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"],
        index: true,
    },
    tags: {
        type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        default: [],
        validate: [
            {
                validator: function (tags: mongoose.Types.ObjectId[]) {
                    const tagIds = tags.map(tag => tag.toString());
                    return new Set(tagIds).size === tagIds.length;
                },
                message: "Duplicate tags are not allowed"
            },
            {
                validator: async function (tags: mongoose.Types.ObjectId[]) {
                    if (tags.length === 0) return true;

                    try {
                        const existingTags = await Tag.find({
                            _id: { $in: tags },
                            isActive: true
                        }).select('_id');

                        return existingTags.length === tags.length;
                    } catch (error) {
                        console.error('Tag validation error:', error);
                        return false;
                    }
                },
                message: "One or more tags do not exist or are inactive"
            }
        ]
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
    seriesId: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, "Series ID cannot exceed 100 characters"],
    },
    partNumber: {
        type: Number,
        required: false,
        min: [1, "Part number must be at least 1"],
        max: [9999, "Part number cannot exceed 9999"],
    },
}, {
    timestamps: true
});

ArticleSchema.index({ seriesId: 1, partNumber: 1 }, {
    unique: true,
    sparse: true,
    partialFilterExpression: {
        seriesId: { $exists: true },
        partNumber: { $exists: true }
    }
});

ArticleSchema.index({ isPublished: 1, createdAt: -1 });

ArticleSchema.index({ author: 1, createdAt: -1 });

ArticleSchema.index({
    title: "text",
    content: "text",
    tags: "text"
});

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);
export default Article;

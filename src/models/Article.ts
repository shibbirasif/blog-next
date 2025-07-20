import mongoose, { Schema, Document, Model } from "mongoose";
import { sanitizeToPlainText, sanitizeHtmlContent } from '@/utils/sanitization';
import { generateSlug } from '@/utils/slug';
import Tag from "./Tag";

export interface IArticle extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    author: mongoose.Types.ObjectId;
    tags: mongoose.Types.ObjectId[];
    isPublished: boolean;
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
        set: function (value: string) {
            return sanitizeToPlainText(value);
        }
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [250, "Slug cannot exceed 250 characters"]
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        minlength: [10, "Content must be at least 10 characters long"],
        set: function (value: string) {
            return sanitizeHtmlContent(value);
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"],
        index: true,
    },
    tags: {
        type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        required: [true, "At least one tag is required"],
        validate: [
            {
                validator: function (tags: mongoose.Types.ObjectId[]) {
                    return tags.length > 0;
                },
                message: "At least one tag is required"
            },
            {
                validator: function (tags: mongoose.Types.ObjectId[]) {
                    const tagIds = tags.map(tag => tag.toString());
                    return new Set(tagIds).size === tagIds.length;
                },
                message: "Duplicate tags are not allowed"
            },
            {
                validator: async function (tags: mongoose.Types.ObjectId[]) {
                    if (tags.length === 0) return false;

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
}, {
    timestamps: true
});

ArticleSchema.pre('validate', async function (next) {
    if (this.isNew && !this.slug && this.title) {
        const baseSlug = generateSlug(this.title);

        let uniqueSlug = baseSlug;
        let counter = 1;

        const Article = this.constructor as Model<IArticle>;
        while (await Article.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
    next();
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

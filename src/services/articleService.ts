import { dbConnect } from '@/lib/db';
import Article, { IArticle } from '@/models/Article';
import Tag from '@/models/Tag';
import { CreateArticleInput, UpdateArticleInput, PublishArticleInput } from '@/validations/article';
import mongoose from 'mongoose';

export class ArticleService {

    /**
     * Create a new article
     */
    static async createArticle(articleData: CreateArticleInput): Promise<IArticle> {
        await dbConnect();

        // Validate tags exist and are active
        if (articleData.tags && articleData.tags.length > 0) {
            const validTags = await Tag.find({
                _id: { $in: articleData.tags },
                isActive: true
            });

            if (validTags.length !== articleData.tags.length) {
                throw new Error('One or more tags do not exist or are inactive');
            }
        }

        const article = new Article(articleData);
        return await article.save();
    }

    /**
     * Get article by ID
     */
    static async getArticleById(id: string): Promise<IArticle | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        return await Article.findById(id)
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();
    }

    /**
     * Get articles by author
     */
    static async getArticlesByAuthor(
        authorId: string,
        options: {
            page?: number;
            limit?: number;
            published?: boolean;
        } = {}
    ): Promise<{ articles: IArticle[]; total: number; pages: number }> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            throw new Error('Invalid author ID format');
        }

        const { page = 1, limit = 10, published } = options;
        const skip = (page - 1) * limit;

        const filter: any = { author: authorId };
        if (typeof published === 'boolean') {
            filter.isPublished = published;
        }

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate('author', 'name email image bio')
                .populate('tags', 'name color description')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Article.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / limit);

        return { articles, total, pages };
    }

    /**
     * Get published articles (public)
     */
    static async getPublishedArticles(options: {
        page?: number;
        limit?: number;
        tags?: string[];
        search?: string;
    } = {}): Promise<{ articles: IArticle[]; total: number; pages: number }> {
        await dbConnect();

        const { page = 1, limit = 10, tags, search } = options;
        const skip = (page - 1) * limit;

        const filter: any = { isPublished: true };

        // Filter by tags
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }

        // Search in title and content
        if (search) {
            filter.$text = { $search: search };
        }

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate('author', 'name email image bio')
                .populate('tags', 'name color description')
                .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Article.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / limit);

        return { articles, total, pages };
    }

    /**
     * Update article
     */
    static async updateArticle(id: string, updateData: Partial<UpdateArticleInput>): Promise<IArticle | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        // Validate tags if provided
        if (updateData.tags && updateData.tags.length > 0) {
            const validTags = await Tag.find({
                _id: { $in: updateData.tags },
                isActive: true
            });

            if (validTags.length !== updateData.tags.length) {
                throw new Error('One or more tags do not exist or are inactive');
            }
        }

        return await Article.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();
    }

    /**
     * Publish/unpublish article
     */
    static async togglePublishStatus(id: string, isPublished: boolean): Promise<IArticle | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        return await Article.findByIdAndUpdate(
            id,
            { isPublished, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();
    }

    /**
     * Delete article
     */
    static async deleteArticle(id: string): Promise<boolean> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        const result = await Article.findByIdAndDelete(id);
        return !!result;
    }

    /**
     * Get articles in a series
     */
    static async getSeriesArticles(seriesId: string): Promise<IArticle[]> {
        await dbConnect();

        return await Article.find({ seriesId })
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .sort({ partNumber: 1 })
            .exec();
    }

    /**
     * Check if user owns article
     */
    static async verifyOwnership(articleId: string, userId: string): Promise<boolean> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return false;
        }

        const article = await Article.findOne({ _id: articleId, author: userId });
        return !!article;
    }
}

export default ArticleService;

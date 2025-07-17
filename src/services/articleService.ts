import { dbConnect } from '@/lib/db';
import Article from '@/models/Article';
import Tag from '@/models/Tag';
import type { IArticle } from '@/models/Article';
import type { CreateArticleInput, UpdateArticleInput } from '@/validations/article';
import mongoose from 'mongoose';

class ArticleService {


    static async createArticle(articleData: CreateArticleInput): Promise<IArticle> {
        await dbConnect();

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


        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }


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


    static async updateArticle(id: string, updateData: Partial<UpdateArticleInput>): Promise<IArticle | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }


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


    static async deleteArticle(id: string): Promise<boolean> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        const result = await Article.findByIdAndDelete(id);
        return !!result;
    }


    static async getSeriesArticles(seriesId: string): Promise<IArticle[]> {
        await dbConnect();

        return await Article.find({ seriesId })
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .sort({ partNumber: 1 })
            .exec();
    }


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

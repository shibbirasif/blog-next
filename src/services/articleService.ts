import { dbConnect } from '@/lib/db';
import Article from '@/models/Article';
import Tag from '@/models/Tag';
import type { CreateArticleInput, UpdateArticleInput } from '@/validations/article';
import { ArticleDto, ArticleListDto, buildArticleDto, buildArticleListDto } from '@/dtos/ArticleDto';
import mongoose from 'mongoose';

class ArticleService {
    async createArticle(articleData: CreateArticleInput): Promise<ArticleDto> {
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
        const savedArticle = await article.save();

        // Populate the saved article to build DTO
        const populatedArticle = await Article.findById(savedArticle._id)
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();

        if (!populatedArticle) {
            throw new Error('Failed to retrieve created article');
        }

        return buildArticleDto(populatedArticle);
    }


    async getArticleById(id: string): Promise<ArticleDto | null> {
        await dbConnect();

        console.log('Fetching article by ID:', id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        const article = await Article.findById(id)
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();

        return article ? buildArticleDto(article) : null;
    }

    async getArticleBySlug(slug: string): Promise<ArticleDto | null> {
        await dbConnect();

        if (!slug || typeof slug !== 'string') {
            throw new Error('Invalid article slug');
        }

        const article = await Article.findOne({ slug: 'a-article' })
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();

        return article ? buildArticleDto(article) : null;
    }


    async getArticlesByAuthor(
        authorId: string,
        options: {
            page?: number;
            limit?: number;
            published?: boolean;
        } = {}
    ): Promise<{ articles: ArticleListDto[]; total: number; pages: number }> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            throw new Error('Invalid author ID format');
        }

        const { page = 1, limit = 10, published } = options;
        const skip = (page - 1) * limit;

        const filter: { author: string; isPublished?: boolean } = { author: authorId };
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

        return {
            articles: articles.map(article => buildArticleListDto(article)),
            total,
            pages
        };
    }


    async getPublishedArticles(options: {
        page?: number;
        limit?: number;
        tags?: string[];
        search?: string;
    } = {}): Promise<{ articles: ArticleListDto[]; total: number; pages: number }> {
        await dbConnect();

        const { page = 1, limit = 10, tags, search } = options;
        const skip = (page - 1) * limit;

        const filter: { isPublished: boolean; tags?: { $in: string[] }; $text?: { $search: string } } = { isPublished: true };

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

        return {
            articles: articles.map(article => buildArticleListDto(article)),
            total,
            pages
        };
    }


    async updateArticle(id: string, updateData: Partial<UpdateArticleInput>): Promise<ArticleDto | null> {
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

        const article = await Article.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();

        return article ? buildArticleDto(article) : null;
    }


    async togglePublishStatus(id: string, isPublished: boolean): Promise<ArticleDto | null> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        const article = await Article.findByIdAndUpdate(
            id,
            { isPublished, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email image bio')
            .populate('tags', 'name color description')
            .exec();

        return article ? buildArticleDto(article) : null;
    }


    async deleteArticle(id: string): Promise<boolean> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid article ID format');
        }

        const result = await Article.findByIdAndDelete(id);
        return !!result;
    }


    async verifyOwnership(articleId: string, userId: string): Promise<boolean> {
        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return false;
        }

        const article = await Article.findOne({ _id: articleId, author: userId });
        return !!article;
    }
}

export const articleService = new ArticleService();

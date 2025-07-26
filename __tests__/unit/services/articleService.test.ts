import { articleService } from '@/services/articleService';
import { dbConnect } from '@/lib/db';
import Article from '@/models/Article';
import Tag from '@/models/Tag';
import { buildArticleDto, buildArticleListDto } from '@/dtos/ArticleDto';
import { ArticleSortOrder } from '@/constants/enums';
import mongoose from 'mongoose';

// Mock mongoose - only mock what we actually use
jest.mock('mongoose', () => ({
    Types: {
        ObjectId: {
            isValid: jest.fn()
        }
    }
}));

// Mock database connection
jest.mock('@/lib/db');

// Mock Article model
jest.mock('@/models/Article', () => {
    const mockArticleInstance = {
        save: jest.fn()
    };
    const MockArticle = jest.fn().mockImplementation(() => mockArticleInstance);
    (MockArticle as any).find = jest.fn();
    (MockArticle as any).findOne = jest.fn();
    (MockArticle as any).findById = jest.fn();
    (MockArticle as any).findByIdAndDelete = jest.fn();
    (MockArticle as any).findByIdAndUpdate = jest.fn();
    (MockArticle as any).countDocuments = jest.fn();
    return MockArticle;
});

// Mock Tag model
jest.mock('@/models/Tag', () => {
    const MockTag = jest.fn();
    (MockTag as any).find = jest.fn();
    (MockTag as any).findOne = jest.fn();
    (MockTag as any).findById = jest.fn();
    return MockTag;
});

// Mock DTO builders
jest.mock('@/dtos/ArticleDto');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const MockArticle = Article as any;
const MockTag = Tag as any;
const mockBuildArticleDto = buildArticleDto as jest.MockedFunction<typeof buildArticleDto>;
const mockBuildArticleListDto = buildArticleListDto as jest.MockedFunction<typeof buildArticleListDto>;
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe('ArticleService', () => {
    // Mock data
    const mockArticleData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        author: '507f1f77bcf86cd799439012',
        tags: ['507f1f77bcf86cd799439013'],
        isPublished: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    };

    const mockPopulatedArticle = {
        ...mockArticleData,
        author: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Author',
            email: 'test@example.com',
            image: 'avatar.jpg',
            bio: 'Test bio'
        },
        tags: [{
            _id: '507f1f77bcf86cd799439013',
            name: 'Test Tag',
            color: '#FF0000',
            description: 'Test tag description'
        }]
    };

    const mockTagData = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test Tag',
        color: '#FF0000',
        description: 'Test tag description',
        isActive: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue({} as any);
        mockBuildArticleDto.mockReturnValue(mockPopulatedArticle as any);
        mockBuildArticleListDto.mockImplementation((article) => mockPopulatedArticle as any);
        (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
    });

    describe('createArticle', () => {
        const createPayload = {
            title: 'Test Article',
            content: 'Test content',
            author: '507f1f77bcf86cd799439012',
            tags: ['507f1f77bcf86cd799439013'],
            isPublished: true
        };

        it('should create an article successfully', async () => {
            // Mock Tag.find to return valid tags
            (MockTag.find as jest.Mock).mockResolvedValue([mockTagData]);

            // Mock Article constructor and save
            const mockSave = jest.fn().mockResolvedValue(mockArticleData);
            MockArticle.mockImplementation(() => ({
                save: mockSave
            } as any));

            // Mock Article.findById for population
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.createArticle(createPayload);

            expect(MockTag.find).toHaveBeenCalledWith({
                _id: { $in: createPayload.tags },
                isActive: true
            });
            expect(MockArticle).toHaveBeenCalledWith({
                title: createPayload.title,
                content: createPayload.content,
                author: createPayload.author,
                tags: createPayload.tags,
                isPublished: createPayload.isPublished
            });
            expect(mockSave).toHaveBeenCalled();
            expect(mockBuildArticleDto).toHaveBeenCalledWith(mockArticleData);
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should throw error for invalid tags', async () => {
            (MockTag.find as jest.Mock).mockResolvedValue([]);

            await expect(articleService.createArticle(createPayload))
                .rejects.toThrow('One or more tags do not exist or are inactive');

            expect(MockTag.find).toHaveBeenCalled();
            expect(MockArticle).not.toHaveBeenCalled();
        });

        it('should create article without tags', async () => {
            const payloadWithoutTags = { ...createPayload, tags: [] };

            const mockSave = jest.fn().mockResolvedValue(mockArticleData);
            MockArticle.mockImplementation(() => ({
                save: mockSave
            } as any));

            // Mock Article.findById for population
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.createArticle(payloadWithoutTags);

            expect(MockTag.find).not.toHaveBeenCalled();
            expect(MockArticle).toHaveBeenCalledWith({
                title: payloadWithoutTags.title,
                content: payloadWithoutTags.content,
                author: payloadWithoutTags.author,
                tags: [],
                isPublished: payloadWithoutTags.isPublished
            });
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should throw error when failed to retrieve created article', async () => {
            (MockTag.find as jest.Mock).mockResolvedValue([mockTagData]);

            const mockSave = jest.fn().mockResolvedValue(mockArticleData);
            MockArticle.mockImplementation(() => ({
                save: mockSave
            } as any));

            // Mock Article.findById to return null (population fails)
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            (MockArticle.findById as jest.Mock).mockReturnValue(mockQuery);

            await expect(articleService.createArticle(createPayload))
                .rejects.toThrow('Failed to retrieve created article');
        });
    });

    describe('getArticleById', () => {
        it('should get article by valid ID', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.getArticleById('507f1f77bcf86cd799439011');

            expect(MockArticle.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name email image bio');
            expect(mockQuery.populate).toHaveBeenCalledWith('tags', 'name color description');
            expect(mockBuildArticleDto).toHaveBeenCalledWith(mockArticleData);
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should return null for non-existent article', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            (MockArticle.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.getArticleById('507f1f77bcf86cd799439011');

            expect(result).toBeNull();
            expect(mockBuildArticleDto).not.toHaveBeenCalled();
        });

        it('should throw error for invalid ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(articleService.getArticleById('invalid-id'))
                .rejects.toThrow('Invalid article ID');

            expect(MockArticle.findById).not.toHaveBeenCalled();
        });
    });

    describe('getArticleBySlug', () => {
        it('should get article by valid slug', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findOne as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.getArticleBySlug('test-article');

            expect(MockArticle.findOne).toHaveBeenCalledWith({ slug: 'test-article' });
            expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name email image bio');
            expect(mockQuery.populate).toHaveBeenCalledWith('tags', 'name color description');
            expect(mockBuildArticleDto).toHaveBeenCalledWith(mockArticleData);
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should return null for non-existent article', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            (MockArticle.findOne as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.getArticleBySlug('non-existent');

            expect(result).toBeNull();
            expect(mockBuildArticleDto).not.toHaveBeenCalled();
        });

        it('should throw error for invalid slug', async () => {
            await expect(articleService.getArticleBySlug(''))
                .rejects.toThrow('Invalid article slug');

            await expect(articleService.getArticleBySlug(null as any))
                .rejects.toThrow('Invalid article slug');

            expect(MockArticle.findOne).not.toHaveBeenCalled();
        });
    });

    describe('deleteArticle', () => {
        it('should delete article successfully', async () => {
            (MockArticle.findByIdAndDelete as jest.Mock).mockResolvedValue(mockArticleData);

            const result = await articleService.deleteArticle('507f1f77bcf86cd799439011');

            expect(MockArticle.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(result).toBe(true);
        });

        it('should return false for non-existent article', async () => {
            (MockArticle.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            const result = await articleService.deleteArticle('507f1f77bcf86cd799439011');

            expect(result).toBe(false);
        });

        it('should throw error for invalid ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(articleService.deleteArticle('invalid-id'))
                .rejects.toThrow('Invalid article ID format');

            expect(MockArticle.findByIdAndDelete).not.toHaveBeenCalled();
        });
    });

    describe('verifyOwnership', () => {
        it('should verify ownership successfully', async () => {
            (MockArticle.findOne as jest.Mock).mockResolvedValue(mockArticleData);

            const result = await articleService.verifyOwnership('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');

            expect(MockArticle.findOne).toHaveBeenCalledWith({
                _id: '507f1f77bcf86cd799439011',
                author: '507f1f77bcf86cd799439012'
            });
            expect(result).toBe(true);
        });

        it('should return false for non-matching ownership', async () => {
            (MockArticle.findOne as jest.Mock).mockResolvedValue(null);

            const result = await articleService.verifyOwnership('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');

            expect(result).toBe(false);
        });

        it('should return false for invalid IDs', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            const result = await articleService.verifyOwnership('invalid-id', 'invalid-author-id');

            expect(result).toBe(false);
            expect(MockArticle.findOne).not.toHaveBeenCalled();
        });
    });

    describe('updateArticle', () => {
        const updatePayload = {
            title: 'Updated Article',
            content: 'Updated content',
            tags: ['507f1f77bcf86cd799439013']
        };

        it('should update article successfully', async () => {
            (MockTag.find as jest.Mock).mockResolvedValue([mockTagData]);

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.updateArticle('507f1f77bcf86cd799439011', updatePayload);

            expect(MockTag.find).toHaveBeenCalledWith({
                _id: { $in: updatePayload.tags },
                isActive: true
            });
            expect(MockArticle.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                expect.objectContaining({
                    ...updatePayload,
                    updatedAt: expect.any(Date)
                }),
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should throw error for invalid tags', async () => {
            (MockTag.find as jest.Mock).mockResolvedValue([]);

            await expect(articleService.updateArticle('507f1f77bcf86cd799439011', updatePayload))
                .rejects.toThrow('One or more tags do not exist or are inactive');
        });

        it('should return null for non-existent article', async () => {
            (MockTag.find as jest.Mock).mockResolvedValue([mockTagData]);

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            (MockArticle.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.updateArticle('507f1f77bcf86cd799439011', updatePayload);

            expect(result).toBeNull();
        });

        it('should throw error for invalid ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(articleService.updateArticle('invalid-id', updatePayload))
                .rejects.toThrow('Invalid article ID format');
        });

        it('should update article without tags', async () => {
            const updatePayloadWithoutTags = {
                title: 'Updated Article',
                content: 'Updated content'
            };

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.updateArticle('507f1f77bcf86cd799439011', updatePayloadWithoutTags);

            expect(MockTag.find).not.toHaveBeenCalled();
            expect(MockArticle.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                expect.objectContaining({
                    ...updatePayloadWithoutTags,
                    updatedAt: expect.any(Date)
                }),
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockPopulatedArticle);
        });
    });

    describe('togglePublishStatus', () => {
        it('should toggle publish status successfully', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockArticleData)
            };
            (MockArticle.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.togglePublishStatus('507f1f77bcf86cd799439011', false);

            expect(MockArticle.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                expect.objectContaining({
                    isPublished: false,
                    updatedAt: expect.any(Date)
                }),
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockPopulatedArticle);
        });

        it('should return null for non-existent article', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            (MockArticle.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await articleService.togglePublishStatus('507f1f77bcf86cd799439011', true);

            expect(result).toBeNull();
        });

        it('should throw error for invalid ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(articleService.togglePublishStatus('invalid-id', true))
                .rejects.toThrow('Invalid article ID format');
        });
    });

    describe('getArticlesByAuthor', () => {
        const mockPaginatedResponse = {
            articles: [mockPopulatedArticle],
            total: 1,
            pages: 1
        };

        beforeEach(() => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([mockArticleData])
            };
            (MockArticle.find as jest.Mock).mockReturnValue(mockQuery);
            (MockArticle.countDocuments as jest.Mock).mockResolvedValue(1);
        });

        it('should get articles by author with default options', async () => {
            const result = await articleService.getArticlesByAuthor('507f1f77bcf86cd799439012');

            expect(MockArticle.find).toHaveBeenCalledWith({ author: '507f1f77bcf86cd799439012' });
            expect(mockBuildArticleListDto).toHaveBeenCalledWith(mockArticleData);
            expect(result).toEqual(mockPaginatedResponse);
        });

        it('should filter by published status', async () => {
            await articleService.getArticlesByAuthor('507f1f77bcf86cd799439012', { published: true });

            expect(MockArticle.find).toHaveBeenCalledWith({
                author: '507f1f77bcf86cd799439012',
                isPublished: true
            });
        });

        it('should throw error for invalid author ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            await expect(articleService.getArticlesByAuthor('invalid-id'))
                .rejects.toThrow('Invalid author ID format');
        });

        it('should handle different sort orders', async () => {
            await articleService.getArticlesByAuthor('507f1f77bcf86cd799439012', {
                sortBy: ArticleSortOrder.OLDEST
            });

            // Check that sort was called with ascending order (1)
            expect(MockArticle.find().sort).toHaveBeenCalledWith({ createdAt: 1 });
        });

        it('should handle pagination correctly', async () => {
            await articleService.getArticlesByAuthor('507f1f77bcf86cd799439012', {
                page: 2,
                limit: 5
            });

            expect(MockArticle.find().skip).toHaveBeenCalledWith(5); // (page - 1) * limit
            expect(MockArticle.find().limit).toHaveBeenCalledWith(5);
        });

        it('should filter unpublished articles', async () => {
            await articleService.getArticlesByAuthor('507f1f77bcf86cd799439012', {
                published: false
            });

            expect(MockArticle.find).toHaveBeenCalledWith({
                author: '507f1f77bcf86cd799439012',
                isPublished: false
            });
        });
    });

    describe('getPublishedArticles', () => {
        const mockPaginatedResponse = {
            articles: [mockPopulatedArticle],
            total: 1,
            pages: 1
        };

        beforeEach(() => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([mockArticleData])
            };
            (MockArticle.find as jest.Mock).mockReturnValue(mockQuery);
            (MockArticle.countDocuments as jest.Mock).mockResolvedValue(1);
        });

        it('should get published articles with default options', async () => {
            const result = await articleService.getPublishedArticles();

            expect(MockArticle.find).toHaveBeenCalledWith({ isPublished: true });
            expect(result).toEqual(mockPaginatedResponse);
        });

        it('should filter by tags', async () => {
            await articleService.getPublishedArticles({ tags: ['507f1f77bcf86cd799439013'] });

            expect(MockArticle.find).toHaveBeenCalledWith({
                isPublished: true,
                tags: { $in: ['507f1f77bcf86cd799439013'] }
            });
        });

        it('should filter by search term', async () => {
            await articleService.getPublishedArticles({ search: 'test query' });

            expect(MockArticle.find).toHaveBeenCalledWith({
                isPublished: true,
                $text: { $search: 'test query' }
            });
        });

        it('should handle different sort orders', async () => {
            await articleService.getPublishedArticles({
                sortBy: ArticleSortOrder.OLDEST
            });

            expect(MockArticle.find().sort).toHaveBeenCalledWith({ createdAt: 1 });
        });

        it('should handle pagination correctly', async () => {
            await articleService.getPublishedArticles({
                page: 3,
                limit: 10
            });

            expect(MockArticle.find().skip).toHaveBeenCalledWith(20); // (page - 1) * limit
            expect(MockArticle.find().limit).toHaveBeenCalledWith(10);
        });

        it('should use text search sorting when search is provided', async () => {
            await articleService.getPublishedArticles({
                search: 'test query'
            });

            expect(MockArticle.find().sort).toHaveBeenCalledWith({
                score: { $meta: 'textScore' }
            });
        });

        it('should handle combined filters (tags + search)', async () => {
            await articleService.getPublishedArticles({
                tags: ['507f1f77bcf86cd799439013'],
                search: 'test query'
            });

            expect(MockArticle.find).toHaveBeenCalledWith({
                isPublished: true,
                tags: { $in: ['507f1f77bcf86cd799439013'] },
                $text: { $search: 'test query' }
            });
        });
    });
});

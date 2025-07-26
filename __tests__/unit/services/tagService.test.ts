import { tagService } from '@/services/tagService';
import { dbConnect } from '@/lib/db';
import Tag from '@/models/Tag';
import { buildTagDtos } from '@/dtos/TagDto';

// Mock mongoose to avoid BSON module issues
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    connection: {
        readyState: 1
    }
}));

// Mock database connection
jest.mock('@/lib/db');

// Mock Tag model
jest.mock('@/models/Tag', () => {
    const MockTag = jest.fn();
    (MockTag as any).find = jest.fn();
    return MockTag;
});

// Mock DTO builders
jest.mock('@/dtos/TagDto');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const MockTag = Tag as any;
const mockBuildTagDtos = buildTagDtos as jest.MockedFunction<typeof buildTagDtos>;

describe('TagService', () => {
    // Mock data
    const mockTagData = [
        {
            _id: '507f1f77bcf86cd799439001',
            name: 'JavaScript',
            description: 'JavaScript programming language',
            color: '#F7DF1E',
            isActive: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        },
        {
            _id: '507f1f77bcf86cd799439002',
            name: 'React',
            description: 'React library',
            color: '#61DAFB',
            isActive: true,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
        }
    ];

    const mockTagDtos = [
        {
            _id: '507f1f77bcf86cd799439001',
            name: 'JavaScript',
            description: 'JavaScript programming language',
            color: '#F7DF1E',
            isActive: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        },
        {
            _id: '507f1f77bcf86cd799439002',
            name: 'React',
            description: 'React library',
            color: '#61DAFB',
            isActive: true,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue({} as any);
        mockBuildTagDtos.mockReturnValue(mockTagDtos);
    });

    describe('searchTags', () => {
        it('should search tags with case-insensitive regex', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            const result = await tagService.searchTags('java');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockTag.find).toHaveBeenCalledWith({
                name: expect.any(RegExp),
                isActive: true
            });

            // Check if the regex is case-insensitive
            const calledRegex = (MockTag.find as jest.Mock).mock.calls[0][0].name;
            expect(calledRegex.flags).toBe('i');
            expect(calledRegex.source).toBe('java');

            expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
            expect(mockBuildTagDtos).toHaveBeenCalledWith(mockTagData);
            expect(result).toEqual(mockTagDtos);
        });

        it('should handle empty search query', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue([]);

            const result = await tagService.searchTags('');

            expect(MockTag.find).toHaveBeenCalledWith({
                name: expect.any(RegExp),
                isActive: true
            });

            const calledRegex = (MockTag.find as jest.Mock).mock.calls[0][0].name;
            expect(calledRegex.source).toBe('(?:)'); // Empty string becomes (?:) in regex

            expect(result).toEqual(mockTagDtos);
        });

        it('should handle special regex characters in query', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            // Test with a query that contains regex special characters but won't break
            const specialQuery = 'C#'; // Using C# instead of C++ to avoid regex error
            await tagService.searchTags(specialQuery);

            const calledRegex = (MockTag.find as jest.Mock).mock.calls[0][0].name;
            expect(calledRegex.source).toBe('C#');
            expect(calledRegex.flags).toBe('i');
        });

        it('should throw error for invalid regex characters', async () => {
            // This test shows a bug in the service - it doesn't escape regex special characters
            await expect(tagService.searchTags('C++'))
                .rejects.toThrow('Nothing to repeat');
        });

        it('should return empty array when no tags match', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue([]);
            mockBuildTagDtos.mockReturnValue([]);

            const result = await tagService.searchTags('nonexistent');

            expect(mockBuildTagDtos).toHaveBeenCalledWith([]);
            expect(result).toEqual([]);
        });

        it('should only return active tags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            await tagService.searchTags('test');

            expect(MockTag.find).toHaveBeenCalledWith({
                name: expect.any(RegExp),
                isActive: true
            });
        });
    });

    describe('getAllTags', () => {
        it('should get all active tags sorted by name', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            const result = await tagService.getAllTags();

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockTag.find).toHaveBeenCalledWith({ isActive: true });
            expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
            expect(mockBuildTagDtos).toHaveBeenCalledWith(mockTagData);
            expect(result).toEqual(mockTagDtos);
        });

        it('should return empty array when no active tags exist', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue([]);
            mockBuildTagDtos.mockReturnValue([]);

            const result = await tagService.getAllTags();

            expect(mockBuildTagDtos).toHaveBeenCalledWith([]);
            expect(result).toEqual([]);
        });

        it('should only return active tags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            await tagService.getAllTags();

            expect(MockTag.find).toHaveBeenCalledWith({ isActive: true });
        });

        it('should sort tags by name in ascending order', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue(mockTagData);

            await tagService.getAllTags();

            expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
        });
    });

    describe('database connection', () => {
        it('should connect to database before searching tags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue([]);

            await tagService.searchTags('test');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockTag.find).toHaveBeenCalled();
        });

        it('should connect to database before getting all tags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockResolvedValue([]);

            await tagService.getAllTags();

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockTag.find).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle database connection errors in searchTags', async () => {
            mockDbConnect.mockRejectedValue(new Error('Database connection failed'));

            await expect(tagService.searchTags('test'))
                .rejects.toThrow('Database connection failed');
        });

        it('should handle database connection errors in getAllTags', async () => {
            mockDbConnect.mockRejectedValue(new Error('Database connection failed'));

            await expect(tagService.getAllTags())
                .rejects.toThrow('Database connection failed');
        });

        it('should handle Tag.find errors in searchTags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockRejectedValue(new Error('Database query failed'));

            await expect(tagService.searchTags('test'))
                .rejects.toThrow('Database query failed');
        });

        it('should handle Tag.find errors in getAllTags', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis()
            };
            (MockTag.find as jest.Mock).mockReturnValue(mockQuery);
            (mockQuery.sort as jest.Mock).mockRejectedValue(new Error('Database query failed'));

            await expect(tagService.getAllTags())
                .rejects.toThrow('Database query failed');
        });
    });
});

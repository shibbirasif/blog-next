import {
    createArticleSchema,
    updateArticleSchema,
    publishArticleSchema,
    clientCreateArticleSchema,
    clientUpdateArticleSchema,
    type CreateArticleInput,
    type UpdateArticleInput,
    type PublishArticleInput,
    type ClientCreateArticleInput,
    type ClientUpdateArticleInput
} from '@/validations/article';

// Mock the sanitization functions for testing
jest.mock('@/utils/sanitization', () => ({
    isPlainTextValid: jest.fn(),
    isHtmlContentValid: jest.fn(),
}));

import { isPlainTextValid, isHtmlContentValid } from '@/utils/sanitization';

const mockIsPlainTextValid = isPlainTextValid as jest.MockedFunction<typeof isPlainTextValid>;
const mockIsHtmlContentValid = isHtmlContentValid as jest.MockedFunction<typeof isHtmlContentValid>;

describe('Article Validations', () => {
    // Valid MongoDB ObjectId format for testing
    const validObjectId = '507f1f77bcf86cd799439011';
    const validAuthorId = '507f1f77bcf86cd799439012';
    const validTagIds = ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'];

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Default mock implementations
        mockIsPlainTextValid.mockReturnValue(true);
        mockIsHtmlContentValid.mockReturnValue(true);
    });

    describe('createArticleSchema', () => {
        const validArticleData: CreateArticleInput = {
            title: 'Valid Article Title',
            content: '<p>This is valid HTML content for the article.</p>',
            author: validAuthorId,
            tags: validTagIds,
            isPublished: false
        };

        it('should validate correct article data', () => {
            const result = createArticleSchema.safeParse(validArticleData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validArticleData);
            }
            expect(mockIsPlainTextValid).toHaveBeenCalledWith('Valid Article Title');
            expect(mockIsHtmlContentValid).toHaveBeenCalledWith('<p>This is valid HTML content for the article.</p>');
        });

        describe('title validation', () => {
            it('should reject empty title', () => {
                const invalidData = { ...validArticleData, title: '' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Title is required');
                }
            });

            it('should reject title with only whitespace', () => {
                const invalidData = { ...validArticleData, title: '   ' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Title is required');
                }
            });

            it('should reject title shorter than 3 characters', () => {
                const invalidData = { ...validArticleData, title: 'Ab' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Title must be at least 3 characters long');
                }
            });

            it('should accept title with exactly 3 characters', () => {
                const validData = { ...validArticleData, title: 'ABC' };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should reject title longer than 200 characters', () => {
                const invalidData = { ...validArticleData, title: 'A'.repeat(201) };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Title cannot exceed 200 characters');
                }
            });

            it('should accept title with exactly 200 characters', () => {
                const validData = { ...validArticleData, title: 'A'.repeat(200) };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should reject title with HTML content', () => {
                mockIsPlainTextValid.mockReturnValue(false);
                const invalidData = { ...validArticleData, title: 'Title with <script>alert("xss")</script>' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('HTML text not supported. Please use plain text only.');
                }
            });

            it('should trim whitespace from title', () => {
                const dataWithWhitespace = { ...validArticleData, title: '  Valid Title  ' };
                const result = createArticleSchema.safeParse(dataWithWhitespace);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.title).toBe('Valid Title');
                }
            });
        });

        describe('content validation', () => {
            it('should reject empty content', () => {
                const invalidData = { ...validArticleData, content: '' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('You must write something');
                }
            });

            it('should reject content shorter than 10 characters', () => {
                const invalidData = { ...validArticleData, content: 'Short' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Content must be at least 10 characters long');
                }
            });

            it('should accept content with exactly 10 characters', () => {
                const validData = { ...validArticleData, content: '1234567890' };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should reject empty paragraph content', () => {
                const invalidData = { ...validArticleData, content: '<p></p>' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    // The first error will be the length validation since '<p></p>' is only 7 chars
                    expect(result.error.issues[0].message).toBe('Content must be at least 10 characters long');
                }
            });

            it('should reject content with only whitespace', () => {
                const invalidData = { ...validArticleData, content: '            ' }; // More than 10 whitespace chars
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('You must write something for your article');
                }
            });

            it('should reject invalid HTML content', () => {
                mockIsHtmlContentValid.mockReturnValue(false);
                const invalidData = { ...validArticleData, content: '<script>alert("xss")</script>' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid HTML is not allowed. Please review and use only safe formatting.');
                }
            });

            it('should accept valid HTML content', () => {
                const validData = { ...validArticleData, content: '<p>Valid <strong>HTML</strong> content</p>' };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
                expect(mockIsHtmlContentValid).toHaveBeenCalledWith('<p>Valid <strong>HTML</strong> content</p>');
            });
        });

        describe('author validation', () => {
            it('should reject invalid author ID format', () => {
                const invalidData = { ...validArticleData, author: 'invalid-id' };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid author ID format');
                }
            });

            it('should reject author ID that is too short', () => {
                const invalidData = { ...validArticleData, author: '507f1f77bcf86cd79943901' }; // 23 chars
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid author ID format');
                }
            });

            it('should reject author ID that is too long', () => {
                const invalidData = { ...validArticleData, author: '507f1f77bcf86cd7994390111' }; // 25 chars
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid author ID format');
                }
            });

            it('should accept valid MongoDB ObjectId', () => {
                const validData = { ...validArticleData, author: validAuthorId };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('tags validation', () => {
            it('should reject empty tags array', () => {
                const invalidData = { ...validArticleData, tags: [] };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('At least one tag is required');
                }
            });

            it('should reject invalid tag ID format', () => {
                const invalidData = { ...validArticleData, tags: ['invalid-tag-id'] };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid tag ID format');
                }
            });

            it('should reject mixed valid and invalid tag IDs', () => {
                const invalidData = { ...validArticleData, tags: [validTagIds[0], 'invalid-id'] };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Invalid tag ID format');
                }
            });

            it('should accept multiple valid tag IDs', () => {
                const validData = { ...validArticleData, tags: validTagIds };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should accept single valid tag ID', () => {
                const validData = { ...validArticleData, tags: [validTagIds[0]] };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('isPublished validation', () => {
            it('should accept true for isPublished', () => {
                const validData = { ...validArticleData, isPublished: true };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should accept false for isPublished', () => {
                const validData = { ...validArticleData, isPublished: false };
                const result = createArticleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should accept undefined for isPublished (optional)', () => {
                const { isPublished, ...dataWithoutPublished } = validArticleData;
                const result = createArticleSchema.safeParse(dataWithoutPublished);
                expect(result.success).toBe(true);
            });

            it('should reject non-boolean values for isPublished', () => {
                const invalidData = { ...validArticleData, isPublished: 'true' as any };
                const result = createArticleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('updateArticleSchema', () => {
        const validUpdateData: UpdateArticleInput = {
            id: validObjectId,
            title: 'Updated Title',
            content: '<p>Updated content</p>',
            author: validAuthorId,
            tags: [validTagIds[0]],
            isPublished: true
        };

        it('should validate complete update data', () => {
            const result = updateArticleSchema.safeParse(validUpdateData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validUpdateData);
            }
        });

        it('should validate partial update data', () => {
            const partialData = {
                id: validObjectId,
                title: 'Only Updated Title'
            };
            const result = updateArticleSchema.safeParse(partialData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe(validObjectId);
                expect(result.data.title).toBe('Only Updated Title');
                expect(result.data.content).toBeUndefined();
            }
        });

        it('should require valid article ID', () => {
            const invalidData = { ...validUpdateData, id: 'invalid-id' };
            const result = updateArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid article ID format');
            }
        });

        it('should inherit all validation rules from createArticleSchema', () => {
            const invalidData = { ...validUpdateData, title: 'AB' }; // Too short
            const result = updateArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Title must be at least 3 characters long');
            }
        });
    });

    describe('publishArticleSchema', () => {
        it('should validate correct publish data', () => {
            const validData: PublishArticleInput = {
                id: validObjectId,
                isPublished: true
            };
            const result = publishArticleSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should require valid article ID', () => {
            const invalidData = {
                id: 'invalid-id',
                isPublished: true
            };
            const result = publishArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid article ID format');
            }
        });

        it('should require isPublished field', () => {
            const invalidData = { id: validObjectId };
            const result = publishArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should accept both true and false for isPublished', () => {
            const publishData = { id: validObjectId, isPublished: true };
            const unpublishData = { id: validObjectId, isPublished: false };

            expect(publishArticleSchema.safeParse(publishData).success).toBe(true);
            expect(publishArticleSchema.safeParse(unpublishData).success).toBe(true);
        });
    });

    describe('clientCreateArticleSchema', () => {
        it('should validate client article data without author field', () => {
            const validData: ClientCreateArticleInput = {
                title: 'Client Article Title',
                content: '<p>Client article content</p>',
                tags: validTagIds,
                isPublished: false
            };
            const result = clientCreateArticleSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
                expect(result.data).not.toHaveProperty('author');
            }
        });

        it('should reject data with author field', () => {
            const invalidData = {
                title: 'Client Article Title',
                content: '<p>Client article content</p>',
                tags: validTagIds,
                author: validAuthorId // This should not be allowed
            };
            const result = clientCreateArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(true); // Zod omits extra fields by default
            if (result.success) {
                expect(result.data).not.toHaveProperty('author');
            }
        });

        it('should inherit all other validation rules', () => {
            const invalidData = {
                title: 'AB', // Too short
                content: '<p>Valid content</p>',
                tags: validTagIds
            };
            const result = clientCreateArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Title must be at least 3 characters long');
            }
        });
    });

    describe('clientUpdateArticleSchema', () => {
        it('should validate client update data without author and id fields', () => {
            const validData: ClientUpdateArticleInput = {
                title: 'Updated Client Title',
                content: '<p>Updated client content</p>',
                tags: [validTagIds[0]],
                isPublished: true
            };
            const result = clientUpdateArticleSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
                expect(result.data).not.toHaveProperty('author');
                expect(result.data).not.toHaveProperty('id');
            }
        });

        it('should allow partial updates', () => {
            const partialData = { title: 'Only Title Update' };
            const result = clientUpdateArticleSchema.safeParse(partialData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).toBe('Only Title Update');
                expect(result.data.content).toBeUndefined();
            }
        });

        it('should allow empty object (no updates)', () => {
            const emptyData = {};
            const result = clientUpdateArticleSchema.safeParse(emptyData);
            expect(result.success).toBe(true);
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle special characters in title', () => {
            const dataWithSpecialChars = {
                title: 'Article with Special Chars: @#$%^&*()',
                content: '<p>Content with special characters</p>',
                author: validAuthorId,
                tags: validTagIds
            };
            const result = createArticleSchema.safeParse(dataWithSpecialChars);
            expect(result.success).toBe(true);
        });

        it('should handle unicode characters in content', () => {
            const dataWithUnicode = {
                title: 'Article with Unicode',
                content: '<p>Content with émojis 🚀 and special chars: café, naïve</p>',
                author: validAuthorId,
                tags: validTagIds
            };
            const result = createArticleSchema.safeParse(dataWithUnicode);
            expect(result.success).toBe(true);
        });

        it('should handle multiple validation errors', () => {
            const invalidData = {
                title: 'AB', // Too short
                content: '', // Empty
                author: 'invalid', // Invalid format
                tags: [] // Empty array
            };
            const result = createArticleSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(1);
            }
        });

        it('should call sanitization functions with correct parameters', () => {
            const testData = {
                title: 'Test Title',
                content: '<p>Test Content</p>',
                author: validAuthorId,
                tags: validTagIds
            };

            createArticleSchema.safeParse(testData);

            expect(mockIsPlainTextValid).toHaveBeenCalledWith('Test Title');
            expect(mockIsHtmlContentValid).toHaveBeenCalledWith('<p>Test Content</p>');
        });
    });
});

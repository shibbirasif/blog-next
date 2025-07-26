import { userService } from '@/services/userService';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { buildUserDto } from '@/dtos/UserDto';
import { PAGINATION } from '@/constants/common';
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

// Mock User model
jest.mock('@/models/User', () => {
    const mockUserInstance = {
        save: jest.fn()
    };
    const MockUser = jest.fn().mockImplementation(() => mockUserInstance);
    (MockUser as any).find = jest.fn();
    (MockUser as any).findOne = jest.fn();
    (MockUser as any).findById = jest.fn();
    (MockUser as any).findByIdAndUpdate = jest.fn();
    return MockUser;
});

// Mock DTO builder
jest.mock('@/dtos/UserDto');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const MockUser = User as any;
const mockBuildUserDto = buildUserDto as jest.MockedFunction<typeof buildUserDto>;
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe('UserService', () => {
    // Mock data
    const mockUserData = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        image: 'avatar.jpg',
        bio: 'Test bio',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    };

    const mockUserDto = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        image: 'avatar.jpg',
        bio: 'Test bio',
        isEmailVerified: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    };

    const mockUnverifiedUser = {
        ...mockUserData,
        isEmailVerified: false,
        emailVerificationToken: 'test-token-123',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue({} as any);
        mockBuildUserDto.mockReturnValue(mockUserDto as any);
        (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
    });

    describe('updateUser', () => {
        const updateData = {
            name: 'Updated User',
            bio: 'Updated bio'
        };

        it('should update user successfully', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockUserData)
            };
            (MockUser.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.updateUser('507f1f77bcf86cd799439011', updateData);

            expect(mockDbConnect).toHaveBeenCalled();
            expect(mockMongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                updateData,
                { new: true }
            );
            expect(mockQuery.lean).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserData);
            expect(result).toEqual(mockUserDto);
        });

        it('should return null for invalid user ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            const result = await userService.updateUser('invalid-id', updateData);

            expect(result).toBeNull();
            expect(MockUser.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should return null for non-existent user', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(null)
            };
            (MockUser.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.updateUser('507f1f77bcf86cd799439011', updateData);

            expect(result).toBeNull();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            const mockQuery = {
                lean: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            (MockUser.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            await expect(userService.updateUser('507f1f77bcf86cd799439011', updateData))
                .rejects.toThrow('Failed to update user with ID: 507f1f77bcf86cd799439011.');

            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('should get all users successfully', async () => {
            const mockUsers = [mockUserData, { ...mockUserData, _id: '507f1f77bcf86cd799439012' }];
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockUsers)
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.getAllUsers();

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.find).toHaveBeenCalledWith({});
            expect(mockQuery.lean).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledTimes(2);
            expect(result).toEqual([mockUserDto, mockUserDto]);
        });

        it('should return empty array when no users exist', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue([])
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.getAllUsers();

            expect(result).toEqual([]);
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should throw error when query fails', async () => {
            const mockQuery = {
                lean: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            await expect(userService.getAllUsers())
                .rejects.toThrow('Failed to retrieve users.');
        });
    });

    describe('searchUsersByName', () => {
        it('should search users by name with default limit', async () => {
            const mockUsers = [mockUserData];
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockUsers)
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.searchUsersByName('test');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.find).toHaveBeenCalledWith({
                name: { $regex: 'test', $options: 'i' }
            });
            expect(mockQuery.limit).toHaveBeenCalledWith(PAGINATION.USERS_SEARCH_LIMIT);
            expect(mockQuery.lean).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserData);
            expect(result).toEqual([mockUserDto]);
        });

        it('should search users by name with custom limit', async () => {
            const mockUsers = [mockUserData];
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockUsers)
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.searchUsersByName('test', 5);

            expect(mockQuery.limit).toHaveBeenCalledWith(5);
            expect(result).toEqual([mockUserDto]);
        });

        it('should return empty array when no users match', async () => {
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([])
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.searchUsersByName('nonexistent');

            expect(result).toEqual([]);
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should handle case-insensitive search', async () => {
            const mockUsers = [mockUserData];
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockUsers)
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            await userService.searchUsersByName('TEST');

            expect(MockUser.find).toHaveBeenCalledWith({
                name: { $regex: 'TEST', $options: 'i' }
            });
        });

        it('should throw error when search fails', async () => {
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            await expect(userService.searchUsersByName('test'))
                .rejects.toThrow('Failed to search users by name.');
        });
    });

    describe('getUserById', () => {
        it('should get user by valid ID', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockUserData)
            };
            (MockUser.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.getUserById('507f1f77bcf86cd799439011');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(mockMongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(MockUser.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockQuery.lean).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserData);
            expect(result).toEqual(mockUserDto);
        });

        it('should return null for invalid user ID', async () => {
            (mockMongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);

            const result = await userService.getUserById('invalid-id');

            expect(result).toBeNull();
            expect(MockUser.findById).not.toHaveBeenCalled();
        });

        it('should return null for non-existent user', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(null)
            };
            (MockUser.findById as jest.Mock).mockReturnValue(mockQuery);

            const result = await userService.getUserById('507f1f77bcf86cd799439011');

            expect(result).toBeNull();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should throw error when query fails', async () => {
            const mockQuery = {
                lean: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            (MockUser.findById as jest.Mock).mockReturnValue(mockQuery);

            await expect(userService.getUserById('507f1f77bcf86cd799439011'))
                .rejects.toThrow('Failed to retrieve user with ID: 507f1f77bcf86cd799439011.');
        });
    });

    describe('verifyUserByVerificationToken', () => {
        it('should verify user successfully', async () => {
            const mockUserInstance = {
                ...mockUnverifiedUser,
                save: jest.fn().mockResolvedValue(mockUserData),
                isEmailVerified: false,
                emailVerificationToken: 'test-token-123',
                emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserInstance);

            const result = await userService.verifyUserByVerificationToken('test-token-123');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({
                emailVerificationToken: 'test-token-123',
                emailVerificationExpires: { $gt: expect.any(Date) }
            });
            expect(mockUserInstance.isEmailVerified).toBe(true);
            expect(mockUserInstance.emailVerificationToken).toBeUndefined();
            expect(mockUserInstance.emailVerificationExpires).toBeUndefined();
            expect(mockUserInstance.save).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserInstance);
            expect(result).toEqual(mockUserDto);
        });

        it('should return null for invalid token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await userService.verifyUserByVerificationToken('invalid-token');

            expect(result).toBeNull();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should return null for expired token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await userService.verifyUserByVerificationToken('expired-token');

            expect(MockUser.findOne).toHaveBeenCalledWith({
                emailVerificationToken: 'expired-token',
                emailVerificationExpires: { $gt: expect.any(Date) }
            });
            expect(result).toBeNull();
        });

        it('should throw error when verification fails', async () => {
            (MockUser.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(userService.verifyUserByVerificationToken('test-token'))
                .rejects.toThrow('Failed to verify user with token.');

            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should throw error when save fails', async () => {
            const mockUserInstance = {
                ...mockUnverifiedUser,
                save: jest.fn().mockRejectedValue(new Error('Save error')),
                isEmailVerified: false,
                emailVerificationToken: 'test-token-123',
                emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserInstance);

            await expect(userService.verifyUserByVerificationToken('test-token-123'))
                .rejects.toThrow('Failed to verify user with token.');
        });
    });

    describe('database connection', () => {
        it('should connect to database for updateUser', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockUserData)
            };
            (MockUser.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

            await userService.updateUser('507f1f77bcf86cd799439011', { name: 'Updated' });

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for getAllUsers', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue([])
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            await userService.getAllUsers();

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for searchUsersByName', async () => {
            const mockQuery = {
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([])
            };
            (MockUser.find as jest.Mock).mockReturnValue(mockQuery);

            await userService.searchUsersByName('test');

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for getUserById', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockUserData)
            };
            (MockUser.findById as jest.Mock).mockReturnValue(mockQuery);

            await userService.getUserById('507f1f77bcf86cd799439011');

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for verifyUserByVerificationToken', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            await userService.verifyUserByVerificationToken('test-token');

            expect(mockDbConnect).toHaveBeenCalled();
        });
    });
});

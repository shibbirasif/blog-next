import { authService } from '@/services/authService';
import { dbConnect } from '@/lib/db';
import { buildUserDto } from '@/dtos/UserDto';
import UserSignupPayload from '@/dtos/UserSignupPayload';
import { generateRandomToken } from '@/lib/tokens';
import { emailSender } from '@/emails/EmailSender';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

// Mock database connection
jest.mock('@/lib/db');

// Mock mongoose to avoid BSON issues
jest.mock('mongoose', () => {
    const mockUserInstance = {
        save: jest.fn(),
        select: jest.fn().mockReturnThis()
    };
    const MockUser = jest.fn().mockImplementation(() => mockUserInstance);
    (MockUser as any).findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis()
    });
    (MockUser as any).findById = jest.fn();
    (MockUser as any).findByIdAndUpdate = jest.fn();
    
    return {
        Schema: jest.fn(),
        model: jest.fn(() => MockUser),
        connect: jest.fn(),
        connection: { readyState: 1 }
    };
});

// Mock DTO builder
jest.mock('@/dtos/UserDto');

// Mock token generator
jest.mock('@/lib/tokens');

// Mock email sender
jest.mock('@/emails/EmailSender', () => ({
    emailSender: {
        sendPasswordResetEmail: jest.fn()
    }
}));

// Mock User model
jest.mock('@/models/User', () => {
    const mockUserInstance = {
        save: jest.fn(),
        select: jest.fn().mockReturnThis()
    };
    const MockUser = jest.fn().mockImplementation(() => mockUserInstance);
    (MockUser as any).findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis()
    });
    (MockUser as any).findById = jest.fn();
    (MockUser as any).findByIdAndUpdate = jest.fn();
    return MockUser;
});

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockBuildUserDto = buildUserDto as jest.MockedFunction<typeof buildUserDto>;
const mockGenerateRandomToken = generateRandomToken as jest.MockedFunction<typeof generateRandomToken>;
const mockEmailSender = emailSender as jest.Mocked<typeof emailSender>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Get the mocked User model
const User = require('@/models/User');
const MockUser = User as any;

describe('AuthService', () => {
    // Mock data
    const mockUserData = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedpassword123',
        password_salt: 'salt123',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
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

    const mockSignupPayload: UserSignupPayload = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
    };

    const mockUserWithResetToken = {
        ...mockUserData,
        resetPasswordToken: 'reset-token-123',
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue({} as any);
        mockBuildUserDto.mockReturnValue(mockUserDto as any);
        mockGenerateRandomToken.mockReturnValue('generated-token-123');
        mockEmailSender.sendPasswordResetEmail.mockResolvedValue(undefined);
    });

    describe('loginUser', () => {
        it('should login user with valid credentials', async () => {
            const mockUserWithPassword = {
                ...mockUserData,
                select: jest.fn().mockReturnThis()
            };
            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUserWithPassword)
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.loginUser('test@example.com', 'password123');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(mockQuery.select).toHaveBeenCalledWith('+password_hash +password_salt');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword123');
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserWithPassword);
            expect(result).toEqual(mockUserDto);
        });

        it('should return null for non-existent user', async () => {
            const mockQuery = {
                select: jest.fn().mockResolvedValue(null)
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);

            const result = await authService.loginUser('nonexistent@example.com', 'password123');

            expect(result).toBeNull();
            expect(mockBcrypt.compare).not.toHaveBeenCalled();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should return null for invalid password', async () => {
            const mockUserWithPassword = {
                ...mockUserData,
                select: jest.fn().mockReturnThis()
            };
            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUserWithPassword)
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await authService.loginUser('test@example.com', 'wrongpassword');

            expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword123');
            expect(result).toBeNull();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should select password fields for authentication', async () => {
            const mockUserWithPassword = {
                ...mockUserData,
                select: jest.fn().mockReturnThis()
            };
            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUserWithPassword)
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

            await authService.loginUser('test@example.com', 'password123');

            expect(mockQuery.select).toHaveBeenCalledWith('+password_hash +password_salt');
        });
    });

    describe('signupUser', () => {
        it('should create new user successfully', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null); // No existing user
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('generated-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('generated-hash');

            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            MockUser.mockImplementation(() => ({
                save: mockSave
            } as any));

            const result = await authService.signupUser(mockSignupPayload);

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
            expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'generated-salt');
            expect(mockGenerateRandomToken).toHaveBeenCalled();
            expect(MockUser).toHaveBeenCalledWith({
                name: 'New User',
                email: 'newuser@example.com',
                password_salt: 'generated-salt',
                password_hash: 'generated-hash',
                emailVerificationToken: 'generated-token-123',
                emailVerificationExpires: expect.any(Date)
            });
            expect(mockSave).toHaveBeenCalled();
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserData);
            expect(result).toEqual(mockUserDto);
        });

        it('should throw error for existing user', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserData); // Existing user

            await expect(authService.signupUser(mockSignupPayload))
                .rejects.toThrow('User with this email already exists.');

            expect(mockBcrypt.genSalt).not.toHaveBeenCalled();
            expect(MockUser).not.toHaveBeenCalled();
        });

        it('should set email verification token and expiry', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('generated-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('generated-hash');

            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            MockUser.mockImplementation(() => ({
                save: mockSave
            } as any));

            await authService.signupUser(mockSignupPayload);

            expect(MockUser).toHaveBeenCalledWith(expect.objectContaining({
                emailVerificationToken: 'generated-token-123',
                emailVerificationExpires: expect.any(Date)
            }));
        });

        it('should hash password with salt rounds 10', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('generated-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('generated-hash');

            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            MockUser.mockImplementation(() => ({
                save: mockSave
            } as any));

            await authService.signupUser(mockSignupPayload);

            expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'generated-salt');
        });
    });

    describe('requestPasswordReset', () => {
        it('should send password reset email for existing user', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserData);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);

            const result = await authService.requestPasswordReset('test@example.com');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(mockGenerateRandomToken).toHaveBeenCalled();
            expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUserData._id,
                {
                    resetPasswordToken: 'generated-token-123',
                    resetPasswordExpires: expect.any(Date)
                }
            );
            expect(mockEmailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
                mockUserDto,
                'generated-token-123'
            );
            expect(result).toBe(true);
        });

        it('should return true for non-existent user (security)', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.requestPasswordReset('nonexistent@example.com');

            expect(result).toBe(true);
            expect(mockGenerateRandomToken).not.toHaveBeenCalled();
            expect(MockUser.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockEmailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
        });

        it('should set reset token expiry to 1 hour', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserData);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);

            const beforeTime = Date.now();
            await authService.requestPasswordReset('test@example.com');
            const afterTime = Date.now();

            const updateCall = (MockUser.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
            const resetExpires = updateCall.resetPasswordExpires.getTime();
            
            // Should be approximately 1 hour (3600000ms) from now
            expect(resetExpires).toBeGreaterThan(beforeTime + 3590000); // 59.8 minutes
            expect(resetExpires).toBeLessThan(afterTime + 3610000); // 60.2 minutes
        });
    });

    describe('validateResetToken', () => {
        it('should validate valid reset token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);

            const result = await authService.validateResetToken('reset-token-123');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({
                resetPasswordToken: 'reset-token-123',
                resetPasswordExpires: { $gt: expect.any(Date) }
            });
            expect(mockBuildUserDto).toHaveBeenCalledWith(mockUserWithResetToken);
            expect(result).toEqual(mockUserDto);
        });

        it('should return null for invalid token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.validateResetToken('invalid-token');

            expect(result).toBeNull();
            expect(mockBuildUserDto).not.toHaveBeenCalled();
        });

        it('should return null for expired token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.validateResetToken('expired-token');

            expect(MockUser.findOne).toHaveBeenCalledWith({
                resetPasswordToken: 'expired-token',
                resetPasswordExpires: { $gt: expect.any(Date) }
            });
            expect(result).toBeNull();
        });

        it('should check token expiry with current date', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);

            const beforeTime = Date.now();
            await authService.validateResetToken('reset-token-123');
            const afterTime = Date.now();

            const findOneCall = (MockUser.findOne as jest.Mock).mock.calls[0][0];
            const checkTime = findOneCall.resetPasswordExpires.$gt.getTime();
            
            expect(checkTime).toBeGreaterThanOrEqual(beforeTime);
            expect(checkTime).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('resetPassword', () => {
        it('should reset password with valid token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('new-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

            const result = await authService.resetPassword('reset-token-123', 'newpassword123');

            expect(mockDbConnect).toHaveBeenCalled();
            expect(MockUser.findOne).toHaveBeenCalledWith({
                resetPasswordToken: 'reset-token-123',
                resetPasswordExpires: { $gt: expect.any(Date) }
            });
            expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 'new-salt');
            expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUserWithResetToken._id,
                {
                    password_salt: 'new-salt',
                    password_hash: 'new-hash',
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined
                }
            );
            expect(result).toBe(true);
        });

        it('should return false for invalid token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.resetPassword('invalid-token', 'newpassword123');

            expect(result).toBe(false);
            expect(mockBcrypt.genSalt).not.toHaveBeenCalled();
            expect(MockUser.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should return false for expired token', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);

            const result = await authService.resetPassword('expired-token', 'newpassword123');

            expect(result).toBe(false);
        });

        it('should clear reset token and expiry after successful reset', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('new-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

            await authService.resetPassword('reset-token-123', 'newpassword123');

            expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUserWithResetToken._id,
                expect.objectContaining({
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined
                })
            );
        });

        it('should hash new password with fresh salt', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('fresh-salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('fresh-hash');

            await authService.resetPassword('reset-token-123', 'mynewpassword');

            expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(mockBcrypt.hash).toHaveBeenCalledWith('mynewpassword', 'fresh-salt');
            expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUserWithResetToken._id,
                expect.objectContaining({
                    password_salt: 'fresh-salt',
                    password_hash: 'fresh-hash'
                })
            );
        });
    });

    describe('database connection', () => {
        it('should connect to database for loginUser', async () => {
            const mockUserWithPassword = {
                ...mockUserData,
                select: jest.fn().mockReturnThis()
            };
            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUserWithPassword)
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);
            (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

            await authService.loginUser('test@example.com', 'password123');

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for signupUser', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hash');

            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            MockUser.mockImplementation(() => ({ save: mockSave } as any));

            await authService.signupUser(mockSignupPayload);

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for requestPasswordReset', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserData);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);

            await authService.requestPasswordReset('test@example.com');

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for validateResetToken', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);

            await authService.validateResetToken('reset-token-123');

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it('should connect to database for resetPassword', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hash');

            await authService.resetPassword('reset-token-123', 'newpassword');

            expect(mockDbConnect).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle database errors in loginUser', async () => {
            const mockQuery = {
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            (MockUser.findOne as jest.Mock).mockReturnValue(mockQuery);

            await expect(authService.loginUser('test@example.com', 'password123'))
                .rejects.toThrow('Database error');
        });

        it('should handle database errors in signupUser', async () => {
            (MockUser.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(authService.signupUser(mockSignupPayload))
                .rejects.toThrow('Database error');
        });

        it('should handle bcrypt errors in signupUser', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(null);
            (mockBcrypt.genSalt as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

            await expect(authService.signupUser(mockSignupPayload))
                .rejects.toThrow('Bcrypt error');
        });

        it('should handle email sending errors in requestPasswordReset', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserData);
            (MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUserData);
            mockEmailSender.sendPasswordResetEmail.mockRejectedValue(new Error('Email error'));

            await expect(authService.requestPasswordReset('test@example.com'))
                .rejects.toThrow('Email error');
        });

        it('should handle database errors in resetPassword', async () => {
            (MockUser.findOne as jest.Mock).mockResolvedValue(mockUserWithResetToken);
            (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (mockBcrypt.hash as jest.Mock).mockResolvedValue('hash');
            (MockUser.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(authService.resetPassword('reset-token-123', 'newpassword'))
                .rejects.toThrow('Database error');
        });
    });
});

import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/api/auth/verify-reset-token/[token]/route";
import { authService } from "@/services/authService";

// Mock authService
jest.mock("@/services/authService", () => ({
    authService: {
        validateResetToken: jest.fn(),
    },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn(),
    },
}));

describe("GET /api/auth/verify-reset-token/[token]", () => {
    let mockRequest: Partial<NextRequest>;
    const mockValidateResetToken = authService.validateResetToken as jest.MockedFunction<typeof authService.validateResetToken>;
    const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;

    const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        isActive: true,
        isEmailVerified: true,
        roles: ["user"],
        bio: "Test bio",
        avatar: "test-avatar.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {};
        mockNextResponseJson.mockImplementation((body, init) => ({ body, init }) as any);
    });

    describe("Success Cases", () => {
        it("should return success for valid token", async () => {
            const token = "valid-reset-token";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(mockUser);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                {
                    message: 'Reset token is valid',
                    user: {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name,
                    }
                },
                { status: 200 }
            );
        });

        it("should handle user with all required fields", async () => {
            const token = "valid-token";
            const params = { params: Promise.resolve({ token }) };
            const fullUser = {
                ...mockUser,
                id: "different-id",
                email: "different@example.com",
                name: "Different User",
            };
            mockValidateResetToken.mockResolvedValue(fullUser);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                {
                    message: 'Reset token is valid',
                    user: {
                        id: fullUser.id,
                        email: fullUser.email,
                        name: fullUser.name,
                    }
                },
                { status: 200 }
            );
        });
    });

    describe("Invalid Token Cases", () => {
        it("should return error for invalid token", async () => {
            const token = "invalid-token";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(null);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        });

        it("should return error for expired token", async () => {
            const token = "expired-token";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(null);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        });

        it("should return error for missing token", async () => {
            const params = { params: Promise.resolve({ token: "" }) };

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Reset token is required' },
                { status: 400 }
            );
        });

        it("should return error for undefined token", async () => {
            const params = { params: Promise.resolve({ token: undefined as any }) };

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Reset token is required' },
                { status: 400 }
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle authService errors", async () => {
            const token = "valid-token";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockRejectedValue(new Error("Database error"));

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to verify reset token' },
                { status: 500 }
            );
        });

        it("should handle unknown errors", async () => {
            const token = "valid-token";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockRejectedValue("Unknown error");

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to verify reset token' },
                { status: 500 }
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle token with special characters", async () => {
            const token = "token-with-special-chars!@#$%";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(mockUser);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                {
                    message: 'Reset token is valid',
                    user: {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name,
                    }
                },
                { status: 200 }
            );
        });

        it("should handle very long token", async () => {
            const token = "a".repeat(1000);
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(mockUser);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                {
                    message: 'Reset token is valid',
                    user: {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name,
                    }
                },
                { status: 200 }
            );
        });

        it("should only return safe user data", async () => {
            const token = "valid-token";
            const params = { params: Promise.resolve({ token }) };
            const userWithSensitiveData = {
                ...mockUser,
                password: "secret-password",
                resetPasswordToken: "secret-token",
                resetPasswordExpires: new Date(),
                emailVerificationToken: "verification-token",
            };
            mockValidateResetToken.mockResolvedValue(userWithSensitiveData as any);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                {
                    message: 'Reset token is valid',
                    user: {
                        id: userWithSensitiveData.id,
                        email: userWithSensitiveData.email,
                        name: userWithSensitiveData.name,
                    }
                },
                { status: 200 }
            );

            // Verify sensitive data is not included
            const call = mockNextResponseJson.mock.calls[0][0] as any;
            expect(call.user).not.toHaveProperty('password');
            expect(call.user).not.toHaveProperty('resetPasswordToken');
            expect(call.user).not.toHaveProperty('resetPasswordExpires');
            expect(call.user).not.toHaveProperty('emailVerificationToken');
        });

        it("should handle whitespace in token", async () => {
            const token = "  valid-token  ";
            const params = { params: Promise.resolve({ token }) };
            mockValidateResetToken.mockResolvedValue(mockUser);

            const response = await GET(mockRequest as NextRequest, params);

            expect(mockValidateResetToken).toHaveBeenCalledWith(token);
        });
    });
});

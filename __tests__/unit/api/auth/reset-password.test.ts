import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/auth/reset-password/route";
import { authService } from "@/services/authService";

// Mock authService
jest.mock("@/services/authService", () => ({
    authService: {
        resetPassword: jest.fn(),
    },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn(),
    },
}));

describe("POST /api/auth/reset-password", () => {
    let mockRequest: Partial<NextRequest>;
    const mockResetPassword = authService.resetPassword as jest.MockedFunction<typeof authService.resetPassword>;
    const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn(),
        };
        mockNextResponseJson.mockImplementation((body, init) => ({ body, init }) as any);
    });

    describe("Success Cases", () => {
        it("should reset password successfully with valid token and password", async () => {
            const token = "valid-reset-token";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Password has been reset successfully' },
                { status: 200 }
            );
        });
    });

    describe("Failed Reset Cases", () => {
        it("should return error for invalid token", async () => {
            const token = "invalid-token";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(false);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        });

        it("should return error for expired token", async () => {
            const token = "expired-token";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(false);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        });
    });

    describe("Validation Errors", () => {
        it("should return validation error for missing token", async () => {
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ password });

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for empty token", async () => {
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token: "", password });

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for missing password", async () => {
            const token = "valid-token";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token });

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for short password", async () => {
            const token = "valid-token";
            const password = "short";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for long password", async () => {
            const token = "valid-token";
            const password = "a".repeat(51); // 51 characters
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle JSON parsing errors", async () => {
            (mockRequest.json as jest.Mock).mockRejectedValue(new Error("Invalid JSON"));

            const response = await POST(mockRequest as NextRequest);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to reset password' },
                { status: 500 }
            );
        });

        it("should handle authService errors", async () => {
            const token = "valid-token";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockRejectedValue(new Error("Database error"));

            const response = await POST(mockRequest as NextRequest);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to reset password' },
                { status: 500 }
            );
        });

        it("should handle unknown errors", async () => {
            const token = "valid-token";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockRejectedValue("Unknown error");

            const response = await POST(mockRequest as NextRequest);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to reset password' },
                { status: 500 }
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle token with special characters", async () => {
            const token = "token-with-special-chars!@#$%";
            const password = "newPassword123";
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Password has been reset successfully' },
                { status: 200 }
            );
        });

        it("should handle password at minimum length", async () => {
            const token = "valid-token";
            const password = "12345678"; // exactly 8 characters
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Password has been reset successfully' },
                { status: 200 }
            );
        });

        it("should handle password at maximum length", async () => {
            const token = "valid-token";
            const password = "a".repeat(50); // exactly 50 characters
            (mockRequest.json as jest.Mock).mockResolvedValue({ token, password });
            mockResetPassword.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockResetPassword).toHaveBeenCalledWith(token, password);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Password has been reset successfully' },
                { status: 200 }
            );
        });
    });
});

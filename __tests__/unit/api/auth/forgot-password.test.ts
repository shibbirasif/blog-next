import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/auth/forgot-password/route";
import { authService } from "@/services/authService";

// Mock authService
jest.mock("@/services/authService", () => ({
    authService: {
        requestPasswordReset: jest.fn(),
    },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn(),
    },
}));

describe("POST /api/auth/forgot-password", () => {
    let mockRequest: Partial<NextRequest>;
    const mockRequestPasswordReset = authService.requestPasswordReset as jest.MockedFunction<typeof authService.requestPasswordReset>;
    const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            json: jest.fn(),
        };
        mockNextResponseJson.mockImplementation((body, init) => ({ body, init }) as any);
    });

    describe("Success Cases", () => {
        it("should return success message for valid email", async () => {
            const email = "test@example.com";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email });
            mockRequestPasswordReset.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).toHaveBeenCalledWith(email);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'If an account with that email exists, a password reset email has been sent.' },
                { status: 200 }
            );
        });

        it("should return success message even if email doesn't exist (security)", async () => {
            const email = "nonexistent@example.com";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email });
            mockRequestPasswordReset.mockResolvedValue(false);

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).toHaveBeenCalledWith(email);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'If an account with that email exists, a password reset email has been sent.' },
                { status: 200 }
            );
        });
    });

    describe("Validation Errors", () => {
        it("should return validation error for missing email", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({});

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for invalid email format", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({ email: "invalid-email" });

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should return validation error for empty email", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({ email: "" });

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
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
                { message: 'Failed to process password reset request' },
                { status: 500 }
            );
        });

        it("should handle authService errors", async () => {
            const email = "test@example.com";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email });
            mockRequestPasswordReset.mockRejectedValue(new Error("Database error"));

            const response = await POST(mockRequest as NextRequest);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to process password reset request' },
                { status: 500 }
            );
        });

        it("should handle unknown errors", async () => {
            const email = "test@example.com";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email });
            mockRequestPasswordReset.mockRejectedValue("Unknown error");

            const response = await POST(mockRequest as NextRequest);

            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'Failed to process password reset request' },
                { status: 500 }
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle email with whitespace", async () => {
            const email = "  test@example.com  ";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email });
            // This should fail validation since emails with leading/trailing whitespace are invalid

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).not.toHaveBeenCalled();
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Validation Error',
                    errors: expect.any(Array),
                }),
                { status: 400 }
            );
        });

        it("should handle very long email", async () => {
            const longEmail = "a".repeat(100) + "@example.com";
            (mockRequest.json as jest.Mock).mockResolvedValue({ email: longEmail });
            mockRequestPasswordReset.mockResolvedValue(true);

            const response = await POST(mockRequest as NextRequest);

            expect(mockRequestPasswordReset).toHaveBeenCalledWith(longEmail);
            expect(mockNextResponseJson).toHaveBeenCalledWith(
                { message: 'If an account with that email exists, a password reset email has been sent.' },
                { status: 200 }
            );
        });
    });
});

import {
    loginSchema,
    serverSignupSchema,
    clientSignupSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    clientResetPasswordSchema,
    type LoginInput,
    type ServerSignupInput,
    type ClientSignupInput,
    type ForgotPasswordInput,
    type ResetPasswordInput,
    type ClientResetPasswordInput
} from '@/validations/auth';

describe('Auth Validations', () => {
    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData: LoginInput = {
                email: 'test@example.com',
                password: 'password123'
            };

            const result = loginSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject invalid email format', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
                expect(result.error.issues[0].path).toEqual(['email']);
            }
        });

        it('should reject empty email', () => {
            const invalidData = {
                email: '',
                password: 'password123'
            };

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
            }
        });

        it('should reject empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: ''
            };

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password cannot be empty');
                expect(result.error.issues[0].path).toEqual(['password']);
            }
        });

        it('should reject missing fields', () => {
            const invalidData = {};

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toHaveLength(2);
                expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
                expect(result.error.issues.some(issue => issue.path.includes('password'))).toBe(true);
            }
        });
    });

    describe('serverSignupSchema', () => {
        it('should validate correct server signup data', () => {
            const validData: ServerSignupInput = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            const result = serverSignupSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
                email: 'john@example.com',
                password: 'password123'
            };

            const result = serverSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('You must put your name.');
            }
        });

        it('should reject name longer than 100 characters', () => {
            const invalidData = {
                name: 'a'.repeat(101),
                email: 'john@example.com',
                password: 'password123'
            };

            const result = serverSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Name cannot exceed 100 characters');
            }
        });

        it('should reject password shorter than 8 characters', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '1234567'
            };

            const result = serverSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
            }
        });

        it('should reject password longer than 50 characters', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'a'.repeat(51)
            };

            const result = serverSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password cannot exceed 50 characters');
            }
        });

        it('should accept password with exactly 8 characters', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '12345678'
            };

            const result = serverSignupSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept password with exactly 50 characters', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'a'.repeat(50)
            };

            const result = serverSignupSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('clientSignupSchema', () => {
        it('should validate correct client signup data with matching passwords', () => {
            const validData: ClientSignupInput = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            };

            const result = clientSignupSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject when passwords do not match', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'differentpassword'
            };

            const result = clientSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
                expect(result.error.issues[0].path).toEqual(['confirmPassword']);
            }
        });

        it('should inherit all validations from serverSignupSchema', () => {
            // Test that it still validates name length
            const invalidData = {
                name: 'a'.repeat(101),
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            };

            const result = clientSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message === 'Name cannot exceed 100 characters'
                )).toBe(true);
            }
        });

        it('should require confirmPassword field', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
                // missing confirmPassword
            };

            const result = clientSignupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('confirmPassword')
                )).toBe(true);
            }
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in email', () => {
            const testData = {
                email: 'test+tag@example-domain.co.uk',
                password: 'password123'
            };

            const result = loginSchema.safeParse(testData);
            expect(result.success).toBe(true);
        });

        it('should handle unicode characters in name', () => {
            const testData = {
                name: 'José María González',
                email: 'jose@example.com',
                password: 'password123'
            };

            const result = serverSignupSchema.safeParse(testData);
            expect(result.success).toBe(true);
        });

        it('should handle whitespace in name', () => {
            const testData = {
                name: '  John Doe  ',
                email: 'john@example.com',
                password: 'password123'
            };

            const result = serverSignupSchema.safeParse(testData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe('  John Doe  ');
            }
        });
    });

    describe('forgotPasswordSchema', () => {
        it('should validate correct email', () => {
            const validData: ForgotPasswordInput = {
                email: 'user@example.com'
            };

            const result = forgotPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject invalid email format', () => {
            const invalidData = {
                email: 'invalid-email'
            };

            const result = forgotPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
                expect(result.error.issues[0].path).toEqual(['email']);
            }
        });

        it('should reject empty email', () => {
            const invalidData = {
                email: ''
            };

            const result = forgotPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
            }
        });

        it('should reject missing email field', () => {
            const invalidData = {};

            const result = forgotPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].code).toBe('invalid_type');
                expect(result.error.issues[0].path).toEqual(['email']);
            }
        });

        it('should handle various valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                'firstname-lastname@domain.com'
            ];

            validEmails.forEach(email => {
                const result = forgotPasswordSchema.safeParse({ email });
                expect(result.success).toBe(true);
            });
        });
    });

    describe('resetPasswordSchema', () => {
        it('should validate correct reset password data', () => {
            const validData: ResetPasswordInput = {
                token: 'valid-reset-token-123',
                password: 'newpassword123'
            };

            const result = resetPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject empty token', () => {
            const invalidData = {
                token: '',
                password: 'newpassword123'
            };

            const result = resetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Reset token is required');
                expect(result.error.issues[0].path).toEqual(['token']);
            }
        });

        it('should reject missing token', () => {
            const invalidData = {
                password: 'newpassword123'
            };

            const result = resetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].code).toBe('invalid_type');
                expect(result.error.issues[0].path).toEqual(['token']);
            }
        });

        it('should reject password shorter than 8 characters', () => {
            const invalidData = {
                token: 'valid-token',
                password: 'short'
            };

            const result = resetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
                expect(result.error.issues[0].path).toEqual(['password']);
            }
        });

        it('should reject password longer than 50 characters', () => {
            const invalidData = {
                token: 'valid-token',
                password: 'a'.repeat(51)
            };

            const result = resetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password cannot exceed 50 characters');
                expect(result.error.issues[0].path).toEqual(['password']);
            }
        });

        it('should accept password with exactly 8 characters', () => {
            const validData = {
                token: 'valid-token',
                password: '12345678'
            };

            const result = resetPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept password with exactly 50 characters', () => {
            const validData = {
                token: 'valid-token',
                password: 'a'.repeat(50)
            };

            const result = resetPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept various token formats', () => {
            const validTokens = [
                'simple-token',
                'token123',
                'UPPERCASE_TOKEN',
                'mixed-Case_Token123',
                'very-long-token-with-multiple-hyphens-and-numbers-12345'
            ];

            validTokens.forEach(token => {
                const result = resetPasswordSchema.safeParse({
                    token,
                    password: 'validpassword123'
                });
                expect(result.success).toBe(true);
            });
        });
    });

    describe('clientResetPasswordSchema', () => {
        it('should validate correct client reset password data with matching passwords', () => {
            const validData: ClientResetPasswordInput = {
                token: 'valid-reset-token',
                password: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            const result = clientResetPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('should reject when passwords do not match', () => {
            const invalidData = {
                token: 'valid-reset-token',
                password: 'newpassword123',
                confirmPassword: 'differentpassword'
            };

            const result = clientResetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
                expect(result.error.issues[0].path).toEqual(['confirmPassword']);
            }
        });

        it('should reject empty confirmPassword', () => {
            const invalidData = {
                token: 'valid-reset-token',
                password: 'newpassword123',
                confirmPassword: ''
            };

            const result = clientResetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
                expect(result.error.issues[0].path).toEqual(['confirmPassword']);
            }
        });

        it('should reject missing confirmPassword field', () => {
            const invalidData = {
                token: 'valid-reset-token',
                password: 'newpassword123'
            };

            const result = clientResetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].code).toBe('invalid_type');
                expect(result.error.issues[0].path).toEqual(['confirmPassword']);
            }
        });

        it('should inherit all password validation rules from resetPasswordSchema', () => {
            // Test short password
            const shortPasswordData = {
                token: 'valid-token',
                password: 'short',
                confirmPassword: 'short'
            };

            const shortResult = clientResetPasswordSchema.safeParse(shortPasswordData);
            expect(shortResult.success).toBe(false);
            if (!shortResult.success) {
                expect(shortResult.error.issues[0].message).toBe('Password must be at least 8 characters');
            }

            // Test long password
            const longPasswordData = {
                token: 'valid-token',
                password: 'a'.repeat(51),
                confirmPassword: 'a'.repeat(51)
            };

            const longResult = clientResetPasswordSchema.safeParse(longPasswordData);
            expect(longResult.success).toBe(false);
            if (!longResult.success) {
                expect(longResult.error.issues[0].message).toBe('Password cannot exceed 50 characters');
            }
        });

        it('should inherit all token validation rules from resetPasswordSchema', () => {
            const emptyTokenData = {
                token: '',
                password: 'validpassword123',
                confirmPassword: 'validpassword123'
            };

            const result = clientResetPasswordSchema.safeParse(emptyTokenData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Reset token is required');
                expect(result.error.issues[0].path).toEqual(['token']);
            }
        });

        it('should validate case sensitivity in password matching', () => {
            const invalidData = {
                token: 'valid-token',
                password: 'Password123',
                confirmPassword: 'password123'
            };

            const result = clientResetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
            }
        });

        it('should validate whitespace differences in password matching', () => {
            const invalidData = {
                token: 'valid-token',
                password: 'password123',
                confirmPassword: 'password123 '
            };

            const result = clientResetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passwords don't match");
            }
        });
    });
});

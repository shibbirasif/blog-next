import { Html, Head, Body, Container, Text, Heading, Button, Section, Link } from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
    userName: string;
    resetUrl: string;
    platformName: string;
    expirationHours: number;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
    userName,
    resetUrl,
    platformName,
    expirationHours,
}) => {
    const body = {
        backgroundColor: '#f8f8f8',
        fontFamily: 'Helvetica, Arial, sans-serif',
    };

    const container = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        margin: '0 auto',
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
    };

    const headerSection = {
        textAlign: 'center' as const,
        paddingBottom: '20px',
    };

    const logoHeading = {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333333',
        margin: '0',
    };

    const contentSection = {
        paddingTop: '15px',
    };

    const heading = {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        color: '#333333',
        marginBottom: '15px',
    };

    const paragraph = {
        fontSize: '16px',
        lineHeight: '24px',
        color: '#333333',
        marginBottom: '10px',
    };

    const buttonContainer = {
        textAlign: 'center' as const,
        margin: '20px 0',
    };

    const button = {
        backgroundColor: '#ff7f00', // A distinct color for password reset
        color: '#ffffff',
        borderRadius: '4px',
        fontSize: '16px',
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'inline-block',
    };

    const link = {
        color: '#007bff',
        textDecoration: 'none',
        wordBreak: 'break-all' as const,
    };

    const smallText = {
        fontSize: '14px',
        color: '#666666',
        paddingTop: '15px',
    };

    const footerSection = {
        paddingTop: '20px',
        textAlign: 'center' as const,
    };

    const footerText = {
        fontSize: '12px',
        color: '#999999',
    };

    return (
        <Html>
            <Head />
            <Body style={body}>
                <Container style={container}>
                    <Section style={headerSection}>
                        <Heading style={logoHeading}>{platformName}</Heading>
                    </Section>
                    <Section style={contentSection}>
                        <Text style={heading}>Password Reset</Text>
                        <Text style={paragraph}>Hello {userName},</Text>
                        <Text style={paragraph}>
                            We received a request to reset your password for your {platformName} account.
                            If you didn&apos;t make this request, please ignore this email.
                        </Text>
                        <Text style={paragraph}>
                            To reset your password, please click the button below:
                        </Text>
                        <Section style={buttonContainer}>
                            <Button style={{ ...button, padding: '12px 20px' }} href={resetUrl}>
                                Reset My Password
                            </Button>
                        </Section>
                        <Text style={paragraph}>
                            If the button above doesn&apos;t work, you can also copy and paste the following link into your browser:
                            <br />
                            <Link href={resetUrl} style={link}>
                                {resetUrl}
                            </Link>
                        </Text>
                        <Text style={smallText}>
                            This link will expire in {expirationHours} hour(s).
                        </Text>
                        <Text style={smallText}>
                            For security reasons, this link can only be used once.
                        </Text>
                    </Section>
                    <Section style={footerSection}>
                        <Text style={footerText}>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};
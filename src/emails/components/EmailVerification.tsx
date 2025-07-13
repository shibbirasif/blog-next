import { Html, Head, Body, Container, Text, Heading, Button, Section, Link } from '@react-email/components';
import * as React from 'react';

interface EmailVerificationProps {
    userName: string;
    verificationUrl: string;
    platformName: string;
    expirationHours: number;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
    userName,
    verificationUrl,
    platformName,
    expirationHours,
}) => {
    // Basic inline styles (React Email recommends inline styles for best compatibility)
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
        backgroundColor: '#007bff',
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
        wordBreak: 'break-all' as const, // Prevents long URLs from breaking layout
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
                        {/* You might replace this with an Image component for your logo */}
                        <Heading style={logoHeading}>{platformName}</Heading>
                    </Section>
                    <Section style={contentSection}>
                        <Text style={heading}>Welcome to {platformName}!</Text>
                        <Text style={paragraph}>Hello {userName},</Text>
                        <Text style={paragraph}>
                            Thank you for registering. Please click the button below to verify your email address and activate your account.
                        </Text>
                        <Section style={buttonContainer}>
                            <Button style={{ ...button, padding: '12px 20px' }} href={verificationUrl}>
                                Verify My Email
                            </Button>
                        </Section>
                        <Text style={paragraph}>
                            If the button above doesn't work, you can also copy and paste the following link into your browser:
                            <br />
                            <Link href={verificationUrl} style={link}>
                                {verificationUrl}
                            </Link>
                        </Text>
                        <Text style={smallText}>
                            This link will expire in {expirationHours} hour(s).
                        </Text>
                        <Text style={smallText}>
                            If you did not create an account with us, please ignore this email.
                        </Text>
                    </Section>
                    <Section style={footerSection}>
                        <Text style={footerText}>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
};

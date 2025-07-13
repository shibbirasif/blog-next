import { Html, Head, Body, Container, Text, Heading, Section, Link } from '@react-email/components';
import * as React from 'react';

interface PasswordChangedEmailProps {
    userName: string;
    changeDate: string;
    supportUrl: string;
    platformName: string;
}

export const PasswordChangedEmail: React.FC<PasswordChangedEmailProps> = ({
    userName,
    changeDate,
    supportUrl,
    platformName,
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
                        <Text style={heading}>Your Password Has Been Changed</Text>
                        <Text style={paragraph}>Hello {userName},</Text>
                        <Text style={paragraph}>
                            This is a confirmation that the password for your {platformName} account was successfully changed on **{changeDate}**.
                        </Text>
                        <Text style={paragraph}>
                            If you did not make this change, please contact our support team immediately at:
                            <br />
                            <Link href={supportUrl} style={link}>
                                {supportUrl}
                            </Link>
                        </Text>
                        <Text style={smallText}>
                            This is an automated notification. Please do not reply to this email.
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
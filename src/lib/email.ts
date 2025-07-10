import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT == '465',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendEmail(options: EmailOptions) {
    try {
        const info = await transport.sendMail({
            from: process.env.EMAIL_FROM,
            to: Array.isArray(options.to) ? options.to.join(',') : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || htmlToText(options.html),
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: (error as Error).message };
    }
}
import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';

export interface TemplateData {
    userName: string;
    platformName: string;
    currentYear: number;
    [key: string]: any;
}

export interface EmailVerificationTemplateData extends TemplateData {
    verificationUrl: string;
    expirationHours: number;
}

export interface PasswordResetTemplateData extends TemplateData {
    resetUrl: string;
    expirationHours: number;
}

export interface PasswordChangedTemplateData extends TemplateData {
    changeDate: string;
    supportUrl: string;
}

export class EmailTemplateService {
    private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
    private templatesPath: string;
    private helpersInitialized: boolean = false;

    constructor() {
        this.templatesPath = path.join(process.cwd(), 'src', 'emails');
        this.initializeHelpers();
    }

    private initializeHelpers(): void {
        if (!this.helpersInitialized) {
            Handlebars.registerHelper('eq', function (a: any, b: any) {
                return a === b;
            });

            Handlebars.registerHelper('formatDate', function (date: Date) {
                if (date instanceof Date) {
                    return date.toLocaleDateString();
                }
                return date;
            });
            this.helpersInitialized = true;
        }
    }

    private async loadTemplate(templateName: string): Promise<string> {
        const templatePath = path.join(this.templatesPath, `${templateName}.mjml`);
        try {
            return await fs.promises.readFile(templatePath, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to load template ${templateName} from ${templatePath}: ${error}`);
        }
    }

    private compileHandlebarsTemplate(templateName: string, mjmlContent: string): HandlebarsTemplateDelegate {
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName)!;
        }

        this.initializeHelpers();
        const template = Handlebars.compile(mjmlContent);
        this.compiledTemplates.set(templateName, template);
        return template;
    }

    private renderMjmlToHtml(mjmlContent: string): string {
        const { html, errors } = mjml2html(mjmlContent);

        if (errors.length > 0) {
            console.error('MJML compilation errors:', errors);
            throw new Error('Failed to compile MJML template due to MJML errors.');
        }
        return html;
    }

    private getDefaultData(): Partial<TemplateData> {
        return {
            platformName: process.env.PLATFORM_NAME || 'Blog Next',
            currentYear: new Date().getFullYear(),
        };
    }

    private async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
        try {
            const mjmlTemplate = await this.loadTemplate(templateName);
            const handlebarsTemplate = this.compileHandlebarsTemplate(templateName, mjmlTemplate);
            const templateData = { ...this.getDefaultData(), ...data };
            const renderedMjml = handlebarsTemplate(templateData);
            const html = this.renderMjmlToHtml(renderedMjml);
            return html;
        } catch (error) {
            console.error(`Error rendering template ${templateName}:`, error);
            throw new Error(`Failed to render email template: ${templateName}`);
        }
    }

    public async renderEmailVerificationEmail(data: EmailVerificationTemplateData): Promise<string> {
        return this.renderTemplate('email-verification', data);
    }

    public async renderPasswordResetEmail(data: PasswordResetTemplateData): Promise<string> {
        return this.renderTemplate('password-reset', data);
    }

    public async renderPasswordChangedEmail(data: PasswordChangedTemplateData): Promise<string> {
        return this.renderTemplate('password-changed', data);
    }
}

export const emailTemplateService = new EmailTemplateService();
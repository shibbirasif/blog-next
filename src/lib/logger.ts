import pino from 'pino';

const logger = pino({
    level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

    ...(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        },
    }),

    // Add useful metadata
    base: {
        env: process.env.NODE_ENV,
    },
});

// Create API-specific logger with context
export const apiLogger = logger.child({ module: 'api' });

// Create auth-specific logger
export const authLogger = apiLogger.child({ service: 'auth' });

// Utility function to simplify auth logging with common metadata
export const logAuthError = (
    level: 'error' | 'warn',
    message: string,
    endpoint: string,
    error: unknown,
    request?: Request,
    additionalData?: Record<string, unknown>
) => {
    const metadata = {
        endpoint,
        userAgent: request?.headers?.get('user-agent') || 'unknown',
        ...(error instanceof Error
            ? { error: error.message, stack: error.stack }
            : { error: String(error) }
        ),
        ...additionalData,
    };

    authLogger[level](message, metadata);
}; export default logger;

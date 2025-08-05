const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export const API_ROUTES = {
    AUTH: {
        SIGN_IN: () => '/api/auth/signin',
        SIGN_OUT: () => '/api/auth/signout',
    },
    ARTICLE: {
        SHOW: (id: string) => `/api/articles/${id}`,
        CREATE: () => '/api/articles',
        UPDATE: (id: string) => `/api/articles/${id}`,
        DELETE: (id: string) => `/api/articles/${id}`,
        LIST: (userId?: string) => {
            const baseUrl = '/api/articles';
            return userId ? `${baseUrl}?author=${userId}` : baseUrl;
        },
    },
    TAGS: {
        LIST: () => '/api/tags',
    },
    USERS: {
        SHOW: (id: string) => `/api/users/${id}`,
        LIST: () => '/api/users',
        UPDATE: (id: string) => `/api/users/${id}`,
    },
    UPLOAD: () => '/api/file/upload',
};
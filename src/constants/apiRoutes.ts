const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const buildApiUrl = (path: string, isServerComponent = false) => {
    if (isServerComponent) {
        return `${baseUrl}${path}`;
    }
    return path;
};

export const API_ROUTES = {
    AUTH: {
        SIGN_IN: (isServerComponent = false) => buildApiUrl('/api/auth/signin', isServerComponent),
        SIGN_OUT: (isServerComponent = false) => buildApiUrl('/api/auth/signout', isServerComponent),
    },
    ARTICLE: {
        SHOW: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        CREATE: (isServerComponent = false) => buildApiUrl('/api/articles', isServerComponent),
        UPDATE: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        DELETE: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        LIST: (userId?: string, isServerComponent = false) => {
            const baseUrl = buildApiUrl('/api/articles', isServerComponent);
            return userId ? `${baseUrl}?author=${userId}` : baseUrl;
        },
    },
    TAGS: {
        LIST: (isServerComponent = false) => buildApiUrl('/api/tags', isServerComponent),
    },
    USERS: {
        LIST: (isServerComponent = false) => buildApiUrl('/api/users', isServerComponent),
    },
    UPLOAD: (isServerComponent = false) => buildApiUrl('/api/file/upload', isServerComponent),
};
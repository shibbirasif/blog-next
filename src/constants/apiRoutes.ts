const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const buildApiUrl = (path: string, isServerComponent = false) => {
    if (isServerComponent) {
        return `${baseUrl}${path}`;
    }
    return path;
};

export const API_ROUTES = {
    AUTH: {
    },
    ARTICLE: {
        SHOW: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        CREATE: (isServerComponent = false) => buildApiUrl('/api/articles', isServerComponent),
        UPDATE: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        DELETE: (id: string, isServerComponent = false) => buildApiUrl(`/api/articles/${id}`, isServerComponent),
        LIST: (userId: string, isServerComponent = false) => buildApiUrl(`/api/articles?userId=${userId}`, isServerComponent),
    },
    TAGS: {
        LIST: (isServerComponent = false) => buildApiUrl('/api/tags', isServerComponent),
    }
};
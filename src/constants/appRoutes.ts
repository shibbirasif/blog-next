export const APP_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    USER: {
        FEED: (id: string | undefined) => id ? `/user/${id}/feed`: '#',
        ARTICLE: {
            NEW: (id: string | undefined) => id ? `/user/${id}/article/new`: '#',
        }
    }
};
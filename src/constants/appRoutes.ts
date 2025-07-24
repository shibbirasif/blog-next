export const APP_ROUTES = {
    HOME: '/',
    AUTH: {
        SIGNIN: '/signin',
        SIGNUP: '/signup',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        VERIFY_EMAIL: '/verify-email',
    },
    USER: {
        FEED: (id: string | undefined) => id ? `/user/${id}/feed` : '#',
        ARTICLE: {
            NEW: (id: string | undefined) => id ? `/user/${id}/article/new` : '#',
            EDIT: (id: string | undefined, articleId: string | undefined) =>
                id && articleId ? `/user/${id}/article/${articleId}/edit` : '#',
        }
    },
    ARTICLE: {
        SHOW: (id: string | undefined) => id ? `/article/${id}` : '#',
    }
};
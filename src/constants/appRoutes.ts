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
        },
        MY_ARTICLES: (id: string | undefined) => id ? `/user/${id}/my-articles` : '#',
        PREFERENCES: (id: string | undefined) => id ? `/user/${id}/preferences` : '#',
        PROFILE_EDIT: (id: string | undefined) => id ? `/user/${id}/profile-edit` : '#',
        CHANGE_PASSWORD: (id: string | undefined) => id ? `/user/${id}/change-password` : '#',
    },
    ARTICLE: {
        SHOW: (id: string | undefined) => id ? `/article/${id}` : '#',
    }
};
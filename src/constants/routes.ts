export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: {
        FEED: (id: string) => `/user/${id}/feed`,
        
    }
};
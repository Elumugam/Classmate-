export const getApiUrl = () => {
    // 1. Prioritize Environment Variable (if set at build time)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Runtime Check: If we are in the browser (client-side)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If we are NOT on localhost/127.0.0.1, we must be in Production (Netlify)
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return 'https://classmateplus-api.onrender.com';
        }
    }

    // 3. Fallback for Local Development (localhost)
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

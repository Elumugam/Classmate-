// Helper to determine API URL dynamically at runtime
export const getBackendUrl = () => {
    // 1. Build-time / Environment override
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Client-side runtime detection
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return 'https://classmateplus-api.onrender.com';
        }
    }

    // 3. Fallback
    return 'http://localhost:5000';
};

export const API_URL = getBackendUrl();

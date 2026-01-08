// Strict Environment Variable Usage
if (!process.env.NEXT_PUBLIC_API_URL) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        console.error("CRITICAL: NEXT_PUBLIC_API_URL is missing in production!");
    }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const getBackendUrl = () => API_URL; // Keep compatibility

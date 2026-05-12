export function getApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Server-side: need absolute URL
    if (typeof window === 'undefined') {
        const apiUrl = process.env.API_URL || "http://localhost:8080";
        // If it already starts with /api, don't duplicate it if apiUrl includes /api
        const cleanPath = normalizedPath.startsWith('/api') ? normalizedPath.substring(4) : normalizedPath;
        const baseApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        return `${baseApiUrl}/api${cleanPath}`;
    }

    // Client-side: use relative URL to benefit from Next.js rewrites
    return normalizedPath;
}

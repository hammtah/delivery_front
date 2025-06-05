export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const getApiUrl = (endpoint) => {
    return `${API_URL}${endpoint}`;
}; 
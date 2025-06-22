// export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getApiUrl = (endpoint) => {
    // return `${API_URL}${endpoint}`;
    // return `https://examfinalproject.easypub.ma${endpoint}`;
    return 'http://192.168.1.3:8000' + endpoint;
    // return 'http://localhost:8000' + endpoint;
    // return 'http://127.0.0.1:8000' + endpoint;
}; 
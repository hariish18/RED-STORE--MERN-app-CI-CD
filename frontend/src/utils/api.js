// Base API URL: empty by default for relative calls (/api/...), served by the proxy
// Vite in dev and by Nginx in Docker. VITE_API_URL is only used if the API is on a different origin.
export const API_URL = import.meta.env.VITE_API_URL || "";

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { authorization: token } : {};
};

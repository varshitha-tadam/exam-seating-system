// Central API base URL — reads from environment variable in production
// In development: falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://exam-seating-system-zdyd.onrender.com';

export default API_URL;

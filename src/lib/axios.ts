import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000/api/v1' : 'https://kampiva-backend.onrender.com/api/v1',
  withCredentials: true, // Important: Allows sending/receiving HTTP-Only cookies
});

// Interceptor to handle 401 Unauthorized responses (e.g. token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // You could trigger a custom event here to log the user out globally
      window.dispatchEvent(new Event('kampiva-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;

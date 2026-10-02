import axiosInstance from './axiosInstance';

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, confirmPassword }
 */
export const registerApi = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in an existing user or admin
 * @param {Object} credentials - { email, password }
 */
export const loginApi = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch current authenticated user's profile
 */
export const getProfileApi = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

/**
 * Verify admin privileges
 */
export const checkAdminApi = async () => {
  const response = await axiosInstance.get('/auth/admin-check');
  return response.data;
};

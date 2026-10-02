import axiosInstance from './axiosInstance';

/**
 * Fetch products list with optional category and search query parameters
 * @param {Object} params - { category, search }
 */
export const getProductsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/products', { params });
  return response.data;
};

/**
 * Fetch single product details by ID
 * @param {string} id - Product ObjectId
 */
export const getProductByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/products/${id}`);
  return response.data;
};

/**
 * Fetch all categories
 */
export const getCategoriesApi = async () => {
  const response = await axiosInstance.get('/api/categories');
  return response.data;
};

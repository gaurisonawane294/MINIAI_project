import axiosInstance from './axiosInstance';

/**
 * Place a new order with Zero-Trust pricing and Cash on Delivery
 * @param {Object} orderData - { items: [{ product, quantity }], shippingAddress: { name, phone, address, city, pincode } }
 */
export const createOrderApi = async (orderData) => {
  const response = await axiosInstance.post('/api/orders', orderData);
  return response.data;
};

/**
 * Retrieve order history for the authenticated customer
 */
export const getMyOrdersApi = async () => {
  const response = await axiosInstance.get('/api/orders/my-orders');
  return response.data;
};

/**
 * Admin: Retrieve all customer orders in the system
 */
export const getAllOrdersApi = async () => {
  const response = await axiosInstance.get('/api/admin/orders');
  return response.data;
};

/**
 * Admin: Update fulfillment lifecycle status of an order
 * @param {string} orderId - MongoDB ID of the order
 * @param {string} status - New status ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')
 */
export const updateOrderStatusApi = async (orderId, status) => {
  const response = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

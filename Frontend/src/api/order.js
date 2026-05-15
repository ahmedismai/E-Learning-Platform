import api from "./axios";

export const orderService = {
  // POST /api/Order
  create: async (orderData) => {
    const response = await api.post("/Order", orderData);
    return response.data;
  },

  // GET /api/Order (Admin only)
  getAll: async () => {
    const response = await api.get("/Order");
    return response.data;
  },

  // GET /api/Order/Pending (Admin only)
  getPending: async () => {
    const response = await api.get("/Order/Pending");
    return response.data;
  },

  // GET /api/Order/MyOrders
  getMyOrders: async () => {
    const response = await api.get("/Order/MyOrders");
    return response.data;
  },

  // PUT /api/Order/Review (Admin only)
  review: async (reviewData) => {
    const response = await api.put("/Order/Review", reviewData);
    return response.data;
  },
};

export default orderService;

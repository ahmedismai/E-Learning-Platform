import api from "./axios";

export const orderService = {
  // POST /api/Order
  create: async (orderData) => {
    const response = await api.post("/api/Order", orderData);
    return response.data;
  },

  // GET /api/Order (Admin only)
  getAll: async () => {
    const response = await api.get("/api/Order");
    return response.data;
  },

  // GET /api/Order/Pending (Admin only)
  getPending: async () => {
    const response = await api.get("/api/Order/Pending");
    return response.data;
  },

  // GET /api/Order/MyOrders
  getMyOrders: async () => {
    const response = await api.get("/api/Order/MyOrders");
    return response.data;
  },

  // PUT /api/Order/Review (Admin only)
  review: async (reviewData) => {
    const response = await api.put("/api/Order/Review", reviewData);
    return response.data;
  },
};

export default orderService;

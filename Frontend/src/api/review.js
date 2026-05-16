import api from "./axios";

const reviewService = {
  getAllByCourse: async (courseId) => {
    const response = await api.get(`/api/Review/${courseId}`);
    return response.data;
  },

  create: async (reviewData) => {
    const response = await api.post("/api/Review", reviewData);
    return response.data;
  },

  delete: async (courseId, studentId) => {
    const response = await api.delete(`/api/Review/${courseId}/${studentId}`);
    return response.data;
  },
};

export default reviewService;

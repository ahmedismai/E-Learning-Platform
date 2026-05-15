import api from "./axios";

const reviewService = {
  getAllByCourse: async (courseId) => {
    const response = await api.get(`/Review/${courseId}`);
    return response.data;
  },

  create: async (reviewData) => {
    const response = await api.post("/Review", reviewData);
    return response.data;
  },

  delete: async (courseId, studentId) => {
    const response = await api.delete(`/Review/${courseId}/${studentId}`);
    return response.data;
  },
};

export default reviewService;

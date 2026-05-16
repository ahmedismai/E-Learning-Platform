import api from "./axios";

export const enrollmentService = {
  // GET /api/Enrollment (Admin only)
  getAll: async () => {
    const response = await api.get("/api/Enrollment");
    return response.data;
  },

  // POST /api/Enrollment
  create: async (enrollmentData) => {
    const response = await api.post("/api/Enrollment", enrollmentData);
    return response.data;
  },

  // GET /api/Enrollment/ByCourse/{courseId}
  getByCourse: async (courseId) => {
    const response = await api.get(`/api/Enrollment/ByCourse/${courseId}`);
    return response.data;
  },

  // GET /api/Enrollment/ByStudent/{studentId}
  getByStudent: async (studentId) => {
    const response = await api.get(`/api/Enrollment/ByStudent/${studentId}`);
    return response.data;
  },

  // DELETE /api/Enrollment/{enrollmentId}
  delete: async (enrollmentId) => {
    const response = await api.delete(`/api/Enrollment/${enrollmentId}`);
    return response.data;
  },

  // GET /api/Enrollment/{enrollmentId}
  getById: async (enrollmentId) => {
    const response = await api.get(`/api/Enrollment/${enrollmentId}`);
    return response.data;
  },

  // PUT /api/Enrollment/{enrollmentId} (Admin only)
  update: async (enrollmentId, enrollmentData) => {
    const response = await api.put(`/api/Enrollment/${enrollmentId}`, enrollmentData);
    return response.data;
  },
};

export default enrollmentService;

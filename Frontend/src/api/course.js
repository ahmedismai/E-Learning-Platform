import api from "./axios";

const courseService = {
  // GET /api/Course
  getAll: async (params) => {
    const response = await api.get("/Course", { params });
    return response.data;
  },

  // POST /api/Course
  create: async (formData) => {
    const response = await api.post("/Course", formData);
    return response.data;
  },

  // GET /api/Course/List
  getList: async () => {
    const response = await api.get("/Course/List");
    return response.data;
  },

  // GET /api/Course/ByCategory/{categoryId}
  getByCategory: async (categoryId) => {
    const response = await api.get(`/Course/ByCategory/${categoryId}`);
    return response.data;
  },

  // GET /api/Course/ByInstructor/{instructorId}
  getByInstructor: async (instructorId) => {
    const response = await api.get(`/Course/ByInstructor/${instructorId}`);
    return response.data;
  },

  // DELETE /api/Course/{courseId}
  delete: async (courseId) => {
    const response = await api.delete(`/Course/${courseId}`);
    return response.data;
  },

  // GET /api/Course/{courseId}
  getById: async (courseId) => {
    const response = await api.get(`/Course/${courseId}`);
    return response.data;
  },

  // PATCH /api/Course/{courseId}
  update: async (courseId, formData) => {
    const response = await api.patch(`/Course/${courseId}`, formData);
    return response.data;
  },

  // GET /api/Course/pending
  getPending: async () => {
    const response = await api.get("/Course/pending");
    return response.data;
  },

  // PATCH /api/Course/{courseId}/approve
  approve: async (courseId, data) => {
    const response = await api.patch(`/Course/${courseId}/approve`, data);
    return response.data;
  },

  // GET /api/Course/MyCourses
  getMyCourses: async () => {
    const response = await api.get("/Course/MyCourses");
    return response.data;
  },
};

export default courseService;

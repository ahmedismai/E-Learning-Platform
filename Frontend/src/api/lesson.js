import api from "./axios";

export const lessonService = {
  // GET /api/Lesson/{SectionId}
  getBySection: async (sectionId) => {
    const response = await api.get(`/Lesson/${sectionId}`);
    return response.data;
  },

  // DELETE /api/Lesson/{lessonId}
  delete: async (lessonId) => {
    const response = await api.delete(`/Lesson/${lessonId}`);
    return response.data;
  },

  // PATCH /api/Lesson/{lessonId}
  update: async (lessonId, lessonData) => {
    const response = await api.patch(`/Lesson/${lessonId}`, lessonData);
    return response.data;
  },

  // GET /api/Lesson/Details/{lessonId}
  getDetails: async (lessonId) => {
    const response = await api.get(`/Lesson/Details/${lessonId}`);
    return response.data;
  },

  // POST /api/Lesson
  create: async (lessonData) => {
    const response = await api.post("/Lesson", lessonData);
    return response.data;
  },
};

export default lessonService;

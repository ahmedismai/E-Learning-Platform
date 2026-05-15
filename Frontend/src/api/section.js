import api from "./axios";

const sectionService = {
  // GET /api/Section/{courseId}
  getByCourse: async (courseId) => {
    const response = await api.get(`/Section/${courseId}`);
    return response.data;
  },

  // GET /api/Section/Details/{sectionId}
  getDetails: async (sectionId) => {
    const response = await api.get(`/Section/Details/${sectionId}`);
    return response.data;
  },

  // POST /api/Section
  create: async (sectionData) => {
    const response = await api.post("/Section", sectionData);
    return response.data;
  },

  // PATCH /api/Section/{sectionId}
  update: async (sectionId, sectionData) => {
    const response = await api.patch(`/Section/${sectionId}`, sectionData);
    return response.data;
  },

  // DELETE /api/Section/{sectionId}
  delete: async (sectionId) => {
    const response = await api.delete(`/Section/${sectionId}`);
    return response.data;
  },
};

export default sectionService;

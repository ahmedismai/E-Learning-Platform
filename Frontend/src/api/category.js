import api from "./axios";

const categoryService = {
  // GET /api/Category
  getAll: async (name = null) => {
    const response = await api.get("/api/Category", { params: { name } });
    return response.data;
  },

  // GET /api/Category/List
  getList: async () => {
    const response = await api.get("/api/Category/List");
    return response.data;
  },

  // GET /api/Category/{categoryId}
  getById: async (categoryId) => {
    const response = await api.get(`/api/Category/${categoryId}`);
    return response.data;
  },

  // POST /api/Category
  create: async (formData) => {
    const response = await api.post("/api/Category", formData);
    return response.data;
  },

  // PATCH /api/Category/{categoryId}
  update: async (categoryId, formData) => {
    const response = await api.patch(`/api/Category/${categoryId}`, formData);
    return response.data;
  },

  // DELETE /api/Category/{categoryId}
  delete: async (categoryId) => {
    const response = await api.delete(`/api/Category/${categoryId}`);
    return response.data;
  },
};

export default categoryService;

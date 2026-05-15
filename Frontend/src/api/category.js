import api from "./axios";

const categoryService = {
  // GET /api/Category
  getAll: async (name = null) => {
    const response = await api.get("/Category", { params: { name } });
    return response.data;
  },

  // GET /api/Category/List
  getList: async () => {
    const response = await api.get("/Category/List");
    return response.data;
  },

  // GET /api/Category/{categoryId}
  getById: async (categoryId) => {
    const response = await api.get(`/Category/${categoryId}`);
    return response.data;
  },

  // POST /api/Category
  create: async (formData) => {
    const response = await api.post("/Category", formData);
    return response.data;
  },

  // PATCH /api/Category/{categoryId}
  update: async (categoryId, formData) => {
    const response = await api.patch(`/Category/${categoryId}`, formData);
    return response.data;
  },

  // DELETE /api/Category/{categoryId}
  delete: async (categoryId) => {
    const response = await api.delete(`/Category/${categoryId}`);
    return response.data;
  },
};

export default categoryService;

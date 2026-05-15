import api from "./axios";

const accountService = {
  // POST /api/Account/Register
  register: async (registerData) => {
    const response = await api.post("/Account/Register", registerData);
    return response.data;
  },

  // POST /api/Account/Login
  login: async (loginData) => {
    const response = await api.post("/Account/Login", loginData);
    return response.data;
  },

  // POST /api/Account/Logout
  logout: async (refreshToken) => {
    const response = await api.post(`/Account/Logout?refreshToken=${refreshToken}`);
    return response.data;
  },

  // GET /api/Account/Account/GetProfile
  getProfile: async () => {
    const response = await api.get("/Account/Account/GetProfile");
    return response.data;
  },

  // PUT /api/Account/Account/UpdateProfile
  updateProfile: async (profileData) => {
    const response = await api.put("/Account/Account/UpdateProfile", profileData);
    return response.data;
  },

  // GET /api/Account/Users (Admin)
  getAllUsers: async () => {
    const response = await api.get("/Account/Users");
    return response.data;
  },

  // DELETE /api/Account/DeleteUser/{userId} (Admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`/Account/DeleteUser/${userId}`);
    return response.data;
  },

  // POST /api/Account/ResetPassword
  resetPassword: async (email) => {
    const response = await api.post(`/Account/ResetPassword?email=${email}`);
    return response.data;
  },

  // POST /api/Account/NewPassword
  newPassword: async (resetData) => {
    const response = await api.post("/Account/NewPassword", resetData);
    return response.data;
  },

  // GET /api/Account/ConfirmEmail
  confirmEmail: async (userId, token) => {
    const response = await api.get("/Account/ConfirmEmail", {
      params: { userId, token },
    });
    return response.data;
  },

  // POST /api/Account/ResendConfirmEmail
  resendConfirmEmail: async (email) => {
    const response = await api.post(`/Account/ResendConfirmEmail?email=${email}`);
    return response.data;
  },

  // GET /api/Account/ConfirmResetPassword
  confirmResetPassword: async (userId, token) => {
    const response = await api.get("/Account/ConfirmResetPassword", {
      params: { userId, token },
    });
    return response.data;
  },
};

export default accountService;

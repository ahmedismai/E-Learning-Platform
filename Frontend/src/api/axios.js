import axios from "axios";

const api = axios.create({
  baseURL: "",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Wrap the refreshToken string in quotes or send as object depending on backend expectation
          // Backend is [FromBody] string refreshToken, so it expects a JSON string
          const response = await axios.post(
            "/api/Account/RefreshToken",
            JSON.stringify(refreshToken),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

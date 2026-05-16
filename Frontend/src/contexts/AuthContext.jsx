import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;

  const login = async (email, password) => {
    const response = await api.post("/api/Account/Login", { email, password });
    const { accessToken, refreshToken } = response.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    try {
      const profileResponse = await api.get("/api/Account/Account/GetProfile");
      const userData = profileResponse.data.data;

      const rawRole =
        userData.roles && userData.roles.length > 0
          ? userData.roles[0]
          : "Student";

      const userWithRole = {
        ...userData,
        id: userData.userId,
        emailConfirmed: userData.emailConfirmed,
        role: rawRole,
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      setUser(userWithRole);
      return userWithRole;
    } catch (error) {
      console.error("Failed to fetch profile after login", error);
      throw error;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    const response = await api.post("/api/Account/Register", {
      fullName: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword || password,
    });
    return response.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await api.post(`/api/Account/Logout?refreshToken=${refreshToken}`);
      } catch (error) {
        console.error("Failed to logout from server", error);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const payload = {
      fullName: data.fullName || data.name,
    };
    const response = await api.put("/api/Account/Account/UpdateProfile", payload);
    const updatedProfile = response.data.data;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const newUser = {
      ...currentUser,
      fullName: updatedProfile.fullName,
      id: updatedProfile.userId,
      emailConfirmed:
        updatedProfile.emailConfirmed ?? currentUser.emailConfirmed,
    };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

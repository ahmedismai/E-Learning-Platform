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
    const response = await api.post("/Account/Login", { email, password });
    const { accessToken, refreshToken } = response.data;
    
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // After login, fetch the profile to get user details and role
    try {
      const profileResponse = await api.get("/Account/Account/GetProfile");
      const userData = profileResponse.data.data;
      
      const rawRole = userData.roles && userData.roles.length > 0 ? userData.roles[0] : "Student";
      
      const userWithRole = { 
        ...userData,
        id: userData.userId, // Map backend UserId to id
        role: rawRole === "Admin" ? "Administrator" : rawRole
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      setUser(userWithRole);
      return userWithRole;
    } catch (error) {
      console.error("Failed to fetch profile after login", error);
      // Even if profile fetch fails, we have tokens, but frontend needs user info
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const response = await api.post("/Account/Register", {
      fullName: name,
      email: email,
      password: password,
      confirmPassword: password
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await api.put("/Account/Account/UpdateProfile", data);
    const updatedUser = response.data;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const newUser = { ...currentUser, ...updatedUser };
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

export const useAuth = () => useContext(AuthContext);

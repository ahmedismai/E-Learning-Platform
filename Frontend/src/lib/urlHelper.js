import api from "@/api/axios";

export const getFullUrl = (path, type = "Course") => {
  if (!path || path === "No Image Available") return "/placeholder.svg";
  
  // If the path is already a full URL
  if (path.startsWith("http")) {
    // If it's a localhost URL from the backend, replace it with the current API base URL
    const backendBaseUrl = "http://localhost:5282";
    const currentApiBaseUrl = api.defaults.baseURL.replace("/api", "");
    
    if (path.startsWith(backendBaseUrl)) {
      return path.replace(backendBaseUrl, currentApiBaseUrl);
    }
    
    return path;
  }

  const baseUrl = api.defaults.baseURL.replace("/api", "");
  const folder =
    type === "Course"
      ? "Images/Course"
      : type === "Lesson"
        ? "Videos/Lesson"
        : "Files/Lesson";
  
  return `${baseUrl}/${folder}/${path.replace(/\\/g, "/")}`;
};

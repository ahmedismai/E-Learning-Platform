import api from "@/api/axios";

export const getFullUrl = (path, type = "Course") => {
  if (!path || path === "No Image Available") return "/placeholder.svg";
  
  const cleanPath = path.replace(/\\/g, "/");

  const currentApiBaseUrl = api.defaults.baseURL.replace("/api", "");

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    try {
      const urlObj = new URL(cleanPath);
      return `${currentApiBaseUrl}${urlObj.pathname}`;
    } catch (e) {
      return cleanPath;
    }
  }


  const hasFolderStructure = 
    cleanPath.startsWith("Images/") || 
    cleanPath.startsWith("Videos/") || 
    cleanPath.startsWith("Files/");

  if (hasFolderStructure) {
    return `${currentApiBaseUrl}/${cleanPath}`;
  }

  const folder =
    type === "Course"
      ? "Images/Course"
      : type === "Lesson"
        ? "Videos/Lesson"
        : "Files/Lesson";
  
  return `${currentApiBaseUrl}/${folder}/${cleanPath}`;
};
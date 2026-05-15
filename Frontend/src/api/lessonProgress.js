import api from "./axios";

export const lessonProgressService = {
  // POST /api/LessonProgress/complete
  completeLesson: async (lessonData) => {
    const response = await api.post("/LessonProgress/complete", lessonData);
    return response.data;
  },

  // GET /api/LessonProgress/progress/{enrollmentId}
  getProgress: async (enrollmentId) => {
    const response = await api.get(`/LessonProgress/progress/${enrollmentId}`);
    return response.data;
  },
};

export default lessonProgressService;

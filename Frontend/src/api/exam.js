import api from "./axios";

export const examService = {
  // --- Exam Controller Endpoints ---

  // GET /api/Exam (Admin only)
  getAll: async () => {
    const response = await api.get("/Exam");
    return response.data;
  },

  // POST /api/Exam (Instructor/Admin)
  create: async (examData) => {
    const response = await api.post("/Exam", examData);
    return response.data;
  },

  // GET /api/Exam/ByCourse/{courseId}
  getByCourse: async (courseId) => {
    const response = await api.get(`/Exam/ByCourse/${courseId}`);
    return response.data;
  },

  // DELETE /api/Exam/{examId} (Instructor/Admin)
  delete: async (examId) => {
    const response = await api.delete(`/Exam/${examId}`);
    return response.data;
  },

  // PATCH /api/Exam/{examId} (Instructor/Admin)
  update: async (examId, examData) => {
    const response = await api.patch(`/Exam/${examId}`, examData);
    return response.data;
  },

  // GET /api/Exam/Details/{examId} (Instructor/Admin)
  getDetails: async (examId) => {
    const response = await api.get(`/Exam/Details/${examId}`);
    return response.data;
  },

  // POST /api/Exam/StartExam/{examId} (Student)
  startExam: async (examId) => {
    const response = await api.post(`/Exam/StartExam/${examId}`);
    return response.data;
  },

  // POST /api/courses/{courseId}/generate-ai-exam (Instructor/Admin)
  generateAIExam: async (courseId, examDate, duration, requestData) => {
    const response = await api.post(
      `/courses/${courseId}/generate-ai-exam`,
      requestData,
      {
        params: {
          examDate,
          duration,
        },
      },
    );
    return response.data;
  },

  // --- ExamResult Controller Endpoints ---

  // POST /api/ExamResult/Submit (Student)
  submitResult: async (resultData) => {
    const response = await api.post("/ExamResult/Submit", resultData);
    return response.data;
  },

  // GET /api/ExamResult/{id} (Admin/Instructor/Student)
  getResultById: async (id) => {
    const response = await api.get(`/ExamResult/${id}`);
    return response.data;
  },

  // GET /api/ExamResult/ByExam/{examId} (Admin/Instructor)
  getResultsByExam: async (examId) => {
    const response = await api.get(`/ExamResult/ByExam/${examId}`);
    return response.data;
  },

  // GET /api/ExamResult/StudentResults/{courseId} (Admin/Instructor/Student)
  getStudentResults: async (courseId, studentId = null) => {
    const response = await api.get(`/ExamResult/StudentResults/${courseId}`, {
      params: { studentId },
    });
    return response.data;
  },
};

export default examService;

import api from "./axios";

const chatbotService = {
  // POST /api/Chatbot
  ask: async (question) => {
    const response = await api.post("/api/Chatbot", { 
      Question: question 
    });
    return response.data;
  },
};

export default chatbotService;

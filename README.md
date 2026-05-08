# 🎓 LearnHub - Advanced E-Learning Platform

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/frontend-React-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/build-Vite-646CFF.svg?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/styling-Tailwind_CSS-38B2AC.svg?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

LearnHub is a comprehensive, full-stack educational platform designed to provide a seamless learning experience for students, powerful tools for instructors, and robust management capabilities for administrators.

## 🚀 Key Features

### 👤 For Students
- **Course Discovery:** Browse and search for courses across various categories.
- **Interactive Learning:** Access course details, enroll, and track progress.
- **Assessments:** Take quizzes and exams with real-time feedback.
- **Assignments:** Submit assignments and view grades.
- **Certificates:** Earn and download certificates upon course completion.
- **Personalized Dashboard:** Track enrolled courses, grades, and upcoming tasks.
- **Smart Support:** Integrated AI Chatbot for instant assistance.

### 👨‍🏫 For Instructors
- **Course Creation:** Intuitive tools to create, edit, and manage courses.
- **Exam Management:** Create and schedule quizzes and exams.
- **Student Tracking:** Monitor student progress and results.
- **Submission Review:** Grade assignments and provide feedback.
- **Certificate Issuance:** Manage and issue certificates to successful students.

### 🛡️ For Administrators
- **User Management:** Oversee all users (Students, Instructors, Admins).
- **System Overview:** Comprehensive reports and analytics on platform performance.
- **Content Moderation:** Manage courses, categories, and site-wide content.
- **Financial Tracking:** Monitor payments and transactions.

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS, Shadcn UI, Lucide Icons
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM
- **Forms:** React Hook Form, Zod
- **UI Components:** Radix UI, Embla Carousel, Recharts
- **API Client:** Axios
- **AI Integration:** Google Gemini AI (for Chatbot & Smart Assessments)

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/E-Learning-Platform.git
   cd E-Learning-Platform
   ```

2. **Navigate to the frontend directory:**
   ```bash
   cd Frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `Frontend` directory and add your API URL:
   ```env
   VITE_API_URL=your_api_url_here
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

## 📁 Project Structure

```text
Frontend/
├── src/
│   ├── api/          # Axios configuration and API calls
│   ├── components/   # Reusable UI components (shadcn/ui)
│   ├── contexts/     # Auth and other React Contexts
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── pages/        # Application pages (Admin, Instructor, Student)
│   └── App.jsx       # Main application component & routing
├── public/           # Static assets
└── ...               # Configuration files (Vite, Tailwind, ESLint)
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for better education.

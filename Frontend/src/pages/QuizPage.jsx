import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import {
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import AIFeedback from "@/components/AIFeedback";
import { Badge } from "@/components/ui/badge";

import examService from "@/api/exam";

const QuizPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "quiz";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gradeId, setGradeId] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const { user } = useAuth();
  const isInstructor = user?.role === "Instructor";
  const isAiPractice = id === "ai-practice";
  const isPracticeType = type === "practice";
  const aiData = location.state?.quizData;

  // Pre-fetch Guard: Check for prior submission
  useEffect(() => {
    const verifyAccess = async () => {
      if (isInstructor || isAiPractice || isPracticeType) {
        setIsVerifying(false);
        return;
      }
      setIsVerifying(false);
    };

    verifyAccess();
  }, [id, type, isInstructor, isAiPractice, isPracticeType, navigate]);

  // 1. Fetch Exam Data
  const {
    data: fetchedData,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["assessment", type, id],
    queryFn: async () => {
      if (isAiPractice && aiData) return { data: aiData };
      
      // Backend: Student starts exam via POST StartExam, Instructor views Details via GET
      if (isInstructor) {
        return examService.getDetails(id);
      } else {
        return examService.startExam(id);
      }
    },
    enabled: (!isAiPractice || !!aiData) && !isVerifying && !hasSubmitted,
    retry: 1,
  });

  // Navigation Guard
  useEffect(() => {
    if (fetchError?.response?.status === 400) {
      toast.error(fetchError.response?.data?.message || "Assessment unavailable");
      navigate("/dashboard", { replace: true });
    }
  }, [fetchError, navigate]);

  const quizData = fetchedData?.data;

  // 2. Set initial timer
  useEffect(() => {
    if (quizData && !isInstructor) {
      const mins = quizData.durationInMinutes || 15;
      setTimeLeft(mins * 60);
    }
  }, [quizData, isInstructor]);

  // Handle case where AI Practice data is lost (e.g. refresh if it was passed via state)
  if (isAiPractice && !aiData && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-6">
        <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto text-warning">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Session Expired</h2>
          <p className="text-muted-foreground">
            AI-generated assessments are temporary and lost on refresh. Please
            go back and generate a new one.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back to Course
        </Button>
      </div>
    );
  }

  // 3. Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      if (isInstructor)
        return { message: "Instructor preview - no data saved" };
      
      // All exams (including AI practice) are now saved to the backend
      // Backend expects SubmitExamDTO: { ExamId, StartedAt, Answers: [{ QuestionId, AnswerOptionId }] }
      return examService.submitResult(payload);
    },
    onSuccess: (data) => {
      if (isInstructor) {
        toast.info("Preview Mode: No results were saved.");
        navigate(-1);
        return;
      }

      setScore(data.data?.score || 0);
      setShowResults(true);
      setIsFinished(true);

      if (!isAiPractice && !isPracticeType) {
        toast.success("Exam submitted successfully!");
        queryClient.invalidateQueries(["student-dashboard"]);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Submission failed");
    },
  });

  const handleAnswerChange = (qId, optionId) => {
    if (isFinished) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmit = () => {
    if (isFinished || submitMutation.isPending) return;
    
    if (isInstructor) {
      toast.info("Exiting Instructor Preview Mode");
      navigate(-1);
      return;
    }

    const questions = quizData?.questions || [];
    const payloadAnswers = questions.map((q) => {
      const selectedOptionId = answers[q.questionId];
      return {
        questionId: q.questionId,
        answerOptionId: selectedOptionId ? parseInt(selectedOptionId) : null,
      };
    });

    const payload = { 
      examId: parseInt(id),
      startedAt: new Date().toISOString(),
      answers: payloadAnswers 
    };

    submitMutation.mutate(payload);
  };

  // 4. Timer Logic
  useEffect(() => {
    if (timeLeft === null || isFinished || isInstructor) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isInstructor]);

  // 5. Prevent Refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isFinished && timeLeft > 0 && !isInstructor) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFinished, timeLeft, isInstructor]);

  if (isLoading && !isAiPractice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Preparing your assessment...
        </p>
      </div>
    );
  }

  if ((isError || !quizData) && !isAiPractice) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Assessment Unavailable</h2>
          <p className="text-muted-foreground">
            We couldn't load the questions for this {type}. Please try again
            later.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (showResults && (isAiPractice || isPracticeType || type === "exam" || type === "quiz")) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center space-y-8 p-8 bg-card rounded-2xl shadow-xl border border-primary/20 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-inner">
          <Trophy className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black tracking-tight">
            {isAiPractice || isPracticeType ? "Practice Completed!" : "Exam Completed!"}
          </h2>
          <div className="flex justify-center gap-4">
            <div className="p-6 bg-muted/50 rounded-2xl border">
              <p className="text-xs text-muted-foreground uppercase font-black mb-1 tracking-widest">
                Your Final Score
              </p>
              <p
                className={`text-6xl font-black ${score >= 70 ? "text-green-500" : "text-destructive"}`}
              >
                {score}%
              </p>
              <Badge
                variant={score >= 70 ? "success" : "destructive"}
                className="mt-2"
              >
                {score >= 70 ? "PASSED" : "FAILED"}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            {score >= 70
              ? "Congratulations! You've demonstrated a solid understanding of the material."
              : "Don't discourage! Every attempt is a step closer to mastery. Review the feedback below to improve."}
          </p>
        </div>

        {/* AI Tutor Feedback Card */}
        {!isAiPractice && gradeId && (
          <div className="text-left max-w-2xl mx-auto">
            <AIFeedback
              gradeId={gradeId}
              isReviewed={gradeDetails?.isReviewed}
            />
          </div>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate("/dashboard/my-courses")}
            variant="outline"
            className="h-12 px-8 rounded-xl font-bold"
          >
            Return to Course
          </Button>
          <Button
            onClick={() => navigate("/dashboard/quizzes")}
            className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            All Assessments
          </Button>
        </div>
      </div>
    );
  }

  const questions = quizData?.questions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {isInstructor && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center gap-3">
          <ShieldCheck className="text-amber-500 w-6 h-6" />
          <div>
            <p className="font-bold text-amber-800 uppercase text-xs">
              Instructor Preview Mode
            </p>
            <p className="text-amber-700 text-sm">
              You are viewing this quiz as a preview. No results will be saved.
            </p>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b py-4 px-6 flex justify-between items-center rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {isAiPractice ? (
              <BrainCircuit className="w-6 h-6 text-primary" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{quizData?.title}</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {questions.length} Questions •{" "}
              {isAiPractice ? "AI Practice" : type}
            </p>
          </div>
        </div>
        {!isInstructor && (
          <div
            className={`flex items-center gap-3 px-5 py-2 rounded-full border-2 ${timeLeft < 60 ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "bg-primary/5 border-primary/20 text-primary"}`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-mono font-black">
              {Math.floor((timeLeft || 0) / 60)}:
              {((timeLeft || 0) % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </header>

      <div className="px-4 space-y-8">
        {questions.map((q, idx) => {
          const qId = q.questionId;
          return (
            <Card
              key={qId}
              className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <p className="text-lg font-semibold leading-relaxed pt-0.5">
                    {q.questionText}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <RadioGroup
                  value={String(answers[qId] || "")}
                  onValueChange={(val) => handleAnswerChange(qId, val)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {q.options?.map((opt) => (
                    <div
                      key={opt.answerOptionId}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${String(answers[qId]) === String(opt.answerOptionId) ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" : "hover:bg-muted/50 border-transparent bg-muted/20"}`}
                      onClick={() => handleAnswerChange(qId, opt.answerOptionId)}
                    >
                      <RadioGroupItem value={String(opt.answerOptionId)} id={`q-${qId}-o-${opt.answerOptionId}`} />
                      <Label
                        htmlFor={`q-${qId}-o-${opt.answerOptionId}`}
                        className="flex-1 cursor-pointer text-base font-medium"
                      >
                        {opt.optionText}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t p-6 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-primary">
                {Math.round(
                  (Object.keys(answers).length / questions.length) * 100,
                )}
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
              Completion Progress
            </p>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-initial"
            >
              {isInstructor ? "Back" : "Quit"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || isFinished}
              className="flex-1 sm:flex-initial min-w-[160px] h-12 text-lg font-bold shadow-xl shadow-primary/30"
            >
              {submitMutation.isPending
                ? "Processing..."
                : isInstructor
                  ? "Exit Preview"
                  : "Finish Assessment"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuizPage;
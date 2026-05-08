import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";
import { Loader2, Clock, GraduationCap, ShieldCheck } from "lucide-react";

const Exam = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const isInstructor = user?.role === "Instructor";

  // Pre-fetch Guard: Check for prior submission
  useEffect(() => {
    const verifyAccess = async () => {
      if (isInstructor) {
        setIsVerifying(false);
        return;
      }

      try {
        await api.get(`/Exam/${id}`);
        setIsVerifying(false);
      } catch (error) {
        if (error.response?.status === 403) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You have already completed this assessment",
          });
          setHasSubmitted(true);
          navigate("/dashboard", { replace: true });
        } else {
          setIsVerifying(false);
        }
      }
    };

    verifyAccess();
  }, [id, isInstructor, navigate, toast]);

  // Fetch Exam Details
  const { data: examResponse, isLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn: async () => {
      const endpoint = isInstructor ? `/Exam/Details/${id}` : `/Exam/StartExam/${id}`;
      const response = await api.post(endpoint); // StartExam is POST
      return response.data;
    },
    enabled: !isVerifying && !hasSubmitted,
  });

  const exam = examResponse?.data;

  // Submit Exam Mutation
  const submitMutation = useMutation({
    mutationFn: async (examData) => {
      if (isInstructor) return { message: "Instructor preview - no data saved" };
      return api.post("/ExamResult/Submit", examData);
    },
    onSuccess: () => {
      toast({ title: isInstructor ? "Preview Mode: No data saved" : "Exam submitted successfully!" });
      navigate("/dashboard/quizzes", { replace: true });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const handleSubmit = () => {
    if (!exam || submitMutation.isPending) return;
    if (isInstructor) {
       toast({ title: "Preview Mode", description: "Instructors cannot submit exams." });
       navigate("/dashboard/quizzes");
       return;
    }
    const examData = {
      examId: parseInt(id),
      studentId: user.id,
      answers: Object.entries(answers).map(([questionId, answerOptionId]) => ({
        questionId: parseInt(questionId),
        answerOptionId: parseInt(answerOptionId),
      })),
    };
    submitMutation.mutate(examData);
  };

  // ... (inside return, mapping questions)
      <div className="space-y-8">
        {exam.questions?.map((question, index) => (
          <Card key={question.questionId} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="h-2 bg-primary/10" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl leading-relaxed flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm">
                  {index + 1}
                </span>
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <RadioGroup
                value={String(answers[question.questionId] || "")}
                onValueChange={(value) =>
                  handleAnswerChange(question.questionId, value)
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {question.answerOptions?.map((option) => (
                  <Label
                    key={option.answerOptionId}
                    htmlFor={`${question.questionId}-${option.answerOptionId}`}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                       String(answers[question.questionId]) === String(option.answerOptionId) 
                       ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                       : 'border-muted hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={String(option.answerOptionId)}
                      id={`${question.questionId}-${option.answerOptionId}`}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${String(answers[question.questionId]) === String(option.answerOptionId) ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                       {String(answers[question.questionId]) === String(option.answerOptionId) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md p-6 rounded-2xl border shadow-2xl sticky bottom-6">
        <div className="text-sm text-muted-foreground">
           {Object.keys(answers).length} of {exam.questions?.length} questions answered
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
           <Button
             onClick={handleSubmit}
             disabled={submitMutation.isPending}
             size="lg"
             className="px-10 font-bold shadow-xl shadow-primary/20"
           >
             {submitMutation.isPending ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 Submitting...
               </>
             ) : (
               isInstructor ? "Exit Preview" : "Finish & Submit Exam"
             )}
           </Button>
        </div>
      </div>
    </div>
  );
};

export default Exam;

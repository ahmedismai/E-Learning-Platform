import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  ListChecks, 
  GraduationCap 
} from "lucide-react";
import examService from "@/api/exam";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const AIQuizDialog = ({ courseId, buttonText, mode = "student" }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [generatedAssessment, setGeneratedAssessment] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateAIExam = async () => {
    setLoading(true);
    setGeneratedAssessment(null);
    try {
      // Backend: [HttpPost("/api/courses/{courseId}/generate-ai-exam")]
      // Query: DateTime examDate, int duration
      // Body: GenerateAIExamRequestDTO { Topic, NumberOfQuestions, QuestionTypes, Difficulty }
      const response = await examService.generateAIExam(
        courseId,
        new Date().toISOString(),
        30,
        {
          topic: "Course Content Review",
          numberOfQuestions: parseInt(count) || 5,
          questionTypes: ["MCQ"],
          difficulty: "Medium"
        }
      );

      const result = response;
      if (result.success) {
        setGeneratedAssessment(result.data);
        toast({
          title: "AI Exam Generated!",
          description: mode === "instructor" 
            ? "Exam has been generated and saved to your course." 
            : "Practice exam generated. Good luck!",
        });
      } else {
        throw new Error(result.message || "Failed to generate");
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.response?.data?.message || "Could not generate AI content at this time.",
      });
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    if (generatedAssessment) {
      // The backend returns the newly created exam ID
      navigate(`/dashboard/exam/${generatedAssessment}?type=practice`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:border-primary w-full py-5 px-4 justify-start text-left bg-background/50 backdrop-blur-sm overflow-hidden group">
          <Sparkles className="w-4 h-4 text-primary shrink-0 group-hover:animate-pulse" />
          <span className="truncate font-semibold text-sm">{buttonText || 'AI Smart Study'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">AI Exam Generator</DialogTitle>
          </div>
          <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
             COURSE: {buttonText || 'Selected Course'}
          </div>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="count" className="text-sm font-bold">Number of Questions</Label>
            <Input 
              id="count"
              type="number" 
              min="1" 
              max="20" 
              value={count} 
              onChange={(e) => setCount(e.target.value)}
              className="rounded-xl border-muted"
            />
          </div>

          <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            Our AI will analyze the course content to generate a comprehensive practice exam tailored for you.
          </p>

          {generatedAssessment && (
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
              <p className="text-sm font-bold flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary" />
                 Ready: {generatedAssessment.title}
              </p>
              <Button 
                onClick={mode === "instructor" ? () => setOpen(false) : startPractice} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                {mode === "instructor" ? "Exam Saved to Course" : "Start Practice Now"}
              </Button>
            </div>
          )}

          {!generatedAssessment && (
            <Button 
              onClick={generateAIExam} 
              disabled={loading}
              className="w-full h-12 text-lg font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Exam
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuizDialog;


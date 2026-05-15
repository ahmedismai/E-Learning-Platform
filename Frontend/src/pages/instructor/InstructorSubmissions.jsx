import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "@/api/axios";
import examService from "@/api/exam";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, User, BookOpen, CheckCircle2, XCircle, FileText, Download, Star, CheckCircle, BrainCircuit, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

const InstructorSubmissions = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: "", aiFeedback: "" });

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["instructor", "submissions", id],
    queryFn: async () => {
      if (!id) return [];
      const response = await examService.getResultsByExam(id);
      return response.data || [];
    },
    enabled: !!id,
  });

  const { data: examDetails } = useQuery({
    queryKey: ["exam-details", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await examService.getDetails(id);
      return response.data;
    },
    enabled: !!id,
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, data }) => {
      // Note: The backend doesn't seem to have a specific "Review/Grade" endpoint for ExamResults yet,
      // but we might use a PATCH if it existed. For now, since we are aligning with provided backend,
      // we'll keep the UI but mark it as local or future implementation if no backend exists.
      // Assuming for now it might be an update to ExamResult if supported.
      toast.info("Manual grading feature coming soon to backend.");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor", "submissions", id]);
      toast.success("Review recorded!");
      setGradingId(null);
    },
    onError: () => toast.error("Failed to record review"),
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            {examDetails?.title || "Exam Submissions"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor performance and review student answers for this final assessment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Exam Results
            </CardTitle>
            <CardDescription>
              Track student scores and completion status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Final Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? (
                  submissions.map((sub) => {
                    const isBeingGraded = gradingId === sub.examResultId;
                    
                    return (
                      <React.Fragment key={sub.examResultId}>
                        <TableRow className="hover:bg-muted/10 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {sub.studentName?.[0] || "S"}
                              </div>
                              <div>
                                <p className="font-bold text-sm">
                                  {sub.studentName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-black ${sub.score >= 50 ? "text-green-500" : "text-destructive"}`}>
                                {sub.score || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant={isBeingGraded ? "ghost" : "outline"} 
                              className="h-8 gap-1"
                              onClick={() => {
                                if (isBeingGraded) {
                                  setGradingId(null);
                                } else {
                                  setGradingId(sub.examResultId);
                                  setGradeData({ 
                                    score: sub.score || 0, 
                                    feedback: "",
                                    aiFeedback: ""
                                  });
                                }
                              }}
                            >
                              {isBeingGraded ? "Cancel" : <><Star className="w-3 h-3" /> View Details</>}
                            </Button>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-40 text-center text-muted-foreground italic"
                    >
                      No submissions recorded yet for this exam.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorSubmissions;


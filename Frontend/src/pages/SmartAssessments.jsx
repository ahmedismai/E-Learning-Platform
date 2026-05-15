import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  ListChecks,
  GraduationCap,
  FileText,
  Sparkles,
} from "lucide-react";
import Exams from "./Exams";
import AIQuizDialog from "@/components/AIQuizDialog";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import enrollmentService from "@/api/enrollment";

const SmartAssessments = () => {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["enrollments", "me"],
    queryFn: async () => {
      const response = await enrollmentService.getByStudent(user.id);

      return (
        response?.data?.$values || response?.data?.data || response?.data || []
      );
    },
    enabled: !!user,
  });
  const enrollments = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-br from-primary/10 via-background to-background p-8 rounded-[2rem] border border-primary/10 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3">
              Student Hub
            </Badge>
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-yellow-500" /> AI Powered
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            Course Assessments
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Complete your courses by taking required final exams. You can also
            generate AI-powered practice materials to help you prepare.
          </p>
        </div>

        <div className="w-full lg:w-72 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Practice for:
          </p>
          <div className="max-h-[150px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {enrollments.map((e) => (
              <AIQuizDialog
                key={e.courseId}
                courseId={e.courseId}
                buttonText={e.courseTitle || `Course ${e.courseId}`}
              />
            ))}
            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No enrolled courses found
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card/30 rounded-[2rem] border p-8">
        <Exams isSubComponent={true} />
      </div>
    </div>
  );
};

export default SmartAssessments;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import examService from "@/api/exam";
import {
  GraduationCap,
  Timer,
  BookOpen,
  Play,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getFullUrl } from "@/lib/urlHelper";

const Exams = ({ isSubComponent = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isInstructor = user?.role === "Instructor";
  const isAdmin = user?.role === "Admin";

  const { data: fetchedExams = [], isLoading } = useQuery({
    queryKey: ["exams", user?.role, user?.id],
    queryFn: async () => {
      if (user?.role === "Student") {
        const response = await api.get("/api/Dashboards/StudentDashboard");
        return response.data.availableExams || [];
      }
      
      if (user?.role === "Instructor") {
        // Instructors can't use getAll (403), so they must fetch per course
        const coursesResponse = await api.get("/api/Course/MyCourses");
        const courses = coursesResponse.data.data || [];
        
        const examsPromises = courses.map(async (course) => {
          try {
            const examRes = await examService.getByCourse(course.courseId);
            return (examRes.data || []).map(exam => ({
              ...exam,
              courseTitle: course.title
            }));
          } catch (e) {
            return [];
          }
        });
        
        const allExams = await Promise.all(examsPromises);
        return allExams.flat();
      }

      // Admins can use the global endpoint
      const response = await examService.getAll();
      return response.data || [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: examService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["exams"]);
      toast({ title: "Exam deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Could not delete exam",
        variant: "destructive",
      });
    },
  });

  const exams = Array.isArray(fetchedExams)
    ? fetchedExams
    : fetchedExams.data || [];

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );

  return (
    <div
      className={`space-y-6 animate-fade-in ${!isSubComponent ? "max-w-7xl mx-auto p-6" : ""}`}
    >
      {(isInstructor || isAdmin) && !isSubComponent && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center gap-3 mb-6">
          <GraduationCap className="text-amber-500 w-6 h-6" />
          <div>
            <p className="font-bold text-amber-800 uppercase text-xs">
              Management View
            </p>
            <p className="text-amber-700 text-sm">
              You are viewing all exams. Click enter to preview as a student.
            </p>
          </div>
        </div>
      )}
      {!isSubComponent && (
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Final Exams
          </h1>
          <p className="text-muted-foreground mt-1">
            {isInstructor
              ? "Monitor and preview your course assessments"
              : "Complete your courses by taking the final assessments"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <Card
              key={exam.examId}
              className="overflow-hidden border-2 hover:border-primary/20 transition-all group"
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge
                      variant="gradient"
                      className="uppercase text-[10px] font-bold tracking-widest"
                    >
                      Final Exam
                    </Badge>
                    {isInstructor && exam.status === "Draft" && (
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px] font-bold tracking-widest text-amber-600 border-amber-200 bg-amber-50"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Timer className="w-3.5 h-3.5" />
                    {exam.durationInMinutes || exam.duration} mins
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {exam.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {exam.description || "Course Final Assessment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Available from:{" "}
                    {new Date(exam.examDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {exam.courseTitle || `Course ID: ${exam.courseId}`}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    className="flex-1 h-11 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    <Link to={`/dashboard/exam/${exam.examId}?type=exam`}>
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      {isInstructor ? "Preview" : "Enter Hall"}
                    </Link>
                  </Button>
                  {(isInstructor || isAdmin) && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 border-primary/20 hover:bg-primary/5"
                    >
                      <Link to={`/dashboard/review-submissions/${exam.examId}`}>
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Results
                      </Link>
                    </Button>
                  )}
                  {(isInstructor || isAdmin) && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-11 w-11 shadow-lg shadow-destructive/10"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this exam? This will also delete all student results for this exam.",
                          )
                        ) {
                          deleteMutation.mutate(exam.examId);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-16 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No Exams Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {isInstructor
                  ? "You haven't created any exams yet. Go to Create Exam to get started."
                  : "When your instructors publish final exams for your enrolled courses, they will appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Exams;

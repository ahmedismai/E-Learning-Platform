import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import courseService from "@/api/course";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Mail, Award, Loader2, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const StudentManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Instructor's Courses
  const { data: coursesData = {}, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["instructor", "courses", user?.id],
    queryFn: () => courseService.getMyCourses(),
    enabled: !!user && user.role === "Instructor",
  });

  const courses = coursesData.data || [];

  // 2. Fetch all enrollments for these courses
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["instructor", "enrollments", courses.map(c => c.courseId)],
    queryFn: async () => {
      const results = await Promise.all(
        courses.map(async (course) => {
          const response = await api.get(`/Enrollment/ByCourse/${course.courseId}`);
          return response.data.data || [];
        })
      );
      return results.flat();
    },
    enabled: courses.length > 0,
  });

  const reissueMutation = useMutation({
    mutationFn: async ({ studentId, courseId }) => {
      const response = await api.post("/Certificate/instructor/generate", { studentId, courseId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Certificate re-issued successfully");
      queryClient.invalidateQueries(["instructor", "enrollments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to re-issue certificate");
    },
  });

  if (isCoursesLoading || isEnrollmentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground mt-1">Track student progress across your courses</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">{enrollments.length} Total Students</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Enrolled Students
          </CardTitle>
          <CardDescription>Real-time overview of student performance and completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <TableRow key={enrollment.enrollmentId}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold">{enrollment.studentName || "Anonymous User"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {enrollment.studentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <Badge variant="outline" className="font-medium truncate block">
                        {enrollment.courseTitle}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-32 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                          <span>Status</span>
                        </div>
                        <Badge variant="outline">Enrolled</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className="h-7 gap-1"
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => reissueMutation.mutate({ 
                            studentId: enrollment.studentId, 
                            courseId: enrollment.courseId 
                          })}
                          disabled={reissueMutation.isPending}
                        >
                          {reissueMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          Issue Certificate
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No students enrolled in your courses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;

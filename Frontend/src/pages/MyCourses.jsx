import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import enrollmentService from "@/api/enrollment";
import courseService from "@/api/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Award, Trash2, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isStudent = user?.role === "Student";
  const isInstructor = user?.role === "Instructor";

  // Fetch student dashboard data
  const { data: studentDashboard, isLoading: isStudentLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/Dashboards/StudentDashboard");
      return response.data;
    },
    enabled: isStudent,
  });

  // Fetch student enrollments to get enrollmentIds (which are missing in dashboard)
  const { data: enrollmentsResponse, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["enrollments", "me"],
    queryFn: () => enrollmentService.getByStudent(user.id),
    enabled: isStudent,
  });
  const enrollments = enrollmentsResponse?.data || [];

  // Fetch instructor courses
  const { data: instructorCoursesData, isLoading: isInstructorLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => courseService.getMyCourses(),
    enabled: isInstructor,
  });

  // Unenroll Mutation
  const unenrollMutation = useMutation({
    mutationFn: enrollmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["student-dashboard"]);
      queryClient.invalidateQueries(["enrollments", "me"]);
      toast({ title: "Unenrolled successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to unenroll",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      await courseService.delete(courseId);
      toast({
        title: "Success",
        description: "Course deleted successfully.",
      });
      queryClient.invalidateQueries(["instructor-courses"]);
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Could not delete course.",
        variant: "destructive",
      });
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.defaults.baseURL.replace("/api", "");
    return `${baseUrl}/${path.replace(/\\/g, "/")}`;
  };

  const getProgressColor = (progress) => {
    if (progress > 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (isStudentLoading || isInstructorLoading || isEnrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const studentCourses = (studentDashboard?.myCourses || []).map((item) => {
    const enrollment = enrollments.find(e => e.courseId === item.courseId);
    return {
      id: item.courseId,
      enrollmentId: enrollment?.enrollmentId,
      progress: item.progress?.progressPercentage || 0,
      status: (item.progress?.progressPercentage || 0) >= 100 ? "completed" : "active",
      courseId: item.courseId,
      title: item.title,
      thumbnail: item.image,
      instructorName: item.instructorName || "Unknown",
    };
  });

  const instructorCourses = (instructorCoursesData?.data || []).map((item) => ({
    id: item.courseId,
    title: item.title,
    thumbnail: item.imgPath,
    categoryName: item.categoryName,
    price: item.price,
    enrolledCount: item.enrolledCount || 0
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isStudent ? "My Learning Journey" : "Manage My Courses"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isStudent 
              ? "Continue your learning journey" 
              : "Manage your course catalog"}
          </p>
        </div>
        {isInstructor && (
          <Button asChild>
            <Link to="/dashboard/create-course">Create New Course</Link>
          </Button>
        )}
      </div>

      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studentCourses.map((course) => (
            <Card key={course.courseId} className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-white group">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={getFullUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <Badge
                  className={`absolute top-4 right-4 shadow-sm border-none backdrop-blur-sm ${
                    course.status === "completed" 
                      ? "bg-green-500/90 text-white" 
                      : "bg-white/90 text-slate-900"
                  }`}
                >
                  {course.status === "completed" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </>
                  ) : (
                    "In Progress"
                  )}
                </Badge>
                {course.enrollmentId && (
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute bottom-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to unenroll from this course? Your progress will be lost.")) {
                        unenrollMutation.mutate(course.enrollmentId);
                      }
                    }}
                    disabled={unenrollMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                   {course.instructorName}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Progress</span>
                    <span className="text-primary">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <Button
                  className={`w-full mt-6 rounded-full py-6 font-bold transition-all ${
                    course.status === "completed" 
                      ? "hover:bg-primary hover:text-white" 
                      : "shadow-glow hover:shadow-none"
                  }`}
                  variant={
                    course.status === "completed" ? "outline" : "default"
                  }
                  asChild
                >
                  <Link
                    to={`/dashboard/courses/${course.courseId}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Play className={`w-4 h-4 ${course.status !== "completed" ? "fill-current" : ""}`} />
                    {course.status === "completed"
                      ? "Review Course"
                      : "Continue Learning"}
                  </Link>
                </Button>

                {/* Removed Claim Certificate button - Backend not implemented */}
              </CardContent>
            </Card>
          ))}
          {studentCourses.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
               </div>
               <div>
                  <h3 className="text-xl font-bold">No courses yet</h3>
                  <p className="text-muted-foreground">Start your learning journey today!</p>
               </div>
               <Button asChild>
                  <Link to="/courses">Browse Catalog</Link>
               </Button>
            </div>
          )}
        </div>
      )}

      {isInstructor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructorCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={getFullUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-3 right-3" variant="secondary">
                  {course.categoryName || "General"}
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-2 line-clamp-2 h-12">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{course.enrolledCount} students</span>
                  <span>${course.price}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/dashboard/create-course?edit=${course.id}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" className="flex-1" asChild>
                    <Link to={`/dashboard/courses/${course.id}`}>View</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {instructorCourses.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
               <Button asChild>
                  <Link to="/dashboard/create-course">Create Your First Course</Link>
               </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

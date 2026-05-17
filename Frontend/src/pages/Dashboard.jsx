import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import {
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  PlayCircle,
  Calendar,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getFullUrl } from "@/lib/urlHelper";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/Dashboards/StudentDashboard");
      return response.data;
    },
    enabled: !!user,
  });

  const stats = dashboardData?.stats || { totalCourses: 0, totalExams: 0 };
  const rawMyCourses = dashboardData?.myCourses || [];
  const myCourses = rawMyCourses.map((c) => ({
    ...c,
    progress: c.progress?.progressPercentage || 0,
  }));
  const availableExams = dashboardData?.availableExams || [];
  const submittedExams = dashboardData?.submittedExams || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back,{" "}
            <span className="text-primary">{user?.fullName || "Student"}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your learning journey.
          </p>
        </div>
        <Button
          asChild
          variant="gradient"
          className="shadow-lg shadow-primary/20"
        >
          <Link to="/courses">Explore New Courses</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Enrolled Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.totalCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-500" />
              Exams Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalExams}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Active Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {availableExams.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
              <TrendingUp className="w-4 h-4" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {myCourses.length > 0
                ? Math.round(
                    myCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
                      myCourses.length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-primary" />
              Current Courses
            </h2>
            <Link
              to="/dashboard/my-courses"
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {myCourses.length > 0 ? (
              myCourses.slice(0, 3).map((course) => (
                <Card
                  key={course.courseId}
                  className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 relative overflow-hidden">
                      <img
                        src={getFullUrl(course.image)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <CardContent className="flex-1 p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <Badge variant="secondary" className="mb-2">
                            {course.categoryName}
                          </Badge>
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> By{" "}
                            {course.instructorName}
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full shadow-md"
                        >
                          <Link to={`/courses/${course.courseId}`}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-primary">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 p-12 text-center">
                <CardContent className="space-y-4">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">
                    You haven't enrolled in any courses yet.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/courses">Explore Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Exams
            </h2>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Available Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {availableExams.length > 0 ? (
                  availableExams.map((exam) => (
                    <div
                      key={exam.examId}
                      className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                          {exam.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          {exam.courseTitle}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                      >
                        <Link to={`/dashboard/exam/${exam.examId}`}>Start</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No upcoming exams.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-green-500/5 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-600">
                <Award className="w-4 h-4" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {submittedExams.length > 0 ? (
                  submittedExams.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex items-center justify-between"
                    >
                      <p className="font-bold text-sm">{result.examTitle}</p>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600 leading-none">
                          {result.score}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Score
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Complete your first exam to see results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";
import {
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import enrollmentService from "@/api/enrollment";
import courseService from "@/api/course";
import { getFullUrl } from "@/lib/urlHelper";

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Dashboard general stats
  const { data: dashboardData, isLoading: isDashLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/Dashboards/AdminDashboard");
      return response.data;
    },
  });

  // Fetch all enrollments
  const { data: enrollmentsData, isLoading: isEnrollLoading } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: enrollmentService.getAll,
  });
  const allEnrollments = enrollmentsData?.data || [];

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalEnrollments: 0,
  };

  const recentUsers = dashboardData?.recentActiveUsers || [];
  const topCourses = dashboardData?.topCourses || [];

  // Fetch all courses for management
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => courseService.getAll(),
  });
  const allCourses = coursesData?.data?.data || [];

  // Approve/Reject Course Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ courseId, approve }) => {
      return courseService.approve(courseId, { 
        isApproved: approve,
        rejectionReason: approve ? "" : "Course content does not meet guidelines"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course status updated successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.response?.data?.message || "Could not update course status",
        variant: "destructive"
      });
    }
  });

  // Delete Enrollment Mutation
  const deleteEnrollmentMutation = useMutation({
    mutationFn: enrollmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast({ title: "Enrollment deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.response?.data?.message || "Could not delete enrollment",
        variant: "destructive"
      });
    }
  });

  if (isDashLoading) {
    return (
      <div className="p-8 text-center flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin inline mr-2 text-primary w-6 h-6" /> 
        <span className="text-muted-foreground font-medium">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Total Platform Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalStudents} Students • {stats.totalInstructors} Instructors
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-amber-600 font-bold">{stats.pendingCourses} Pending Approval</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active subscriptions across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Recent Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {recentUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                              </div>
                              <div>
                                 <p className="text-sm font-bold">{user.fullName}</p>
                                 <p className="text-[10px] text-muted-foreground">{user.email}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="text-[10px]">
                             Last: {new Date(user.lastActivity).toLocaleDateString()}
                           </Badge>
                        </div>
                      ))}
                      {recentUsers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">No recent active users found.</p>
                      )}
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Top Performing Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {topCourses.map(course => (
                        <div key={course.courseId} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                           <div className="flex items-center gap-3">
                              <img src={getFullUrl(course.courseImage, "Course")} className="w-10 h-8 rounded object-cover border" alt="" />
                              <p className="text-sm font-bold">{course.title}</p>
                           </div>
                           <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span className="text-xs font-bold">{course.averageRating.toFixed(1)}</span>
                           </div>
                        </div>
                      ))}
                      {topCourses.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">No top courses data available.</p>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* Course Management Tab Content */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Verification</CardTitle>
              <CardDescription>Review and approve newly created courses.</CardDescription>
            </CardHeader>
            <CardContent>
              {isCoursesLoading ? (
                <div className="py-10 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" /> Loading courses...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCourses.map((course) => (
                      <TableRow key={course.courseId}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructorName}</TableCell>
                        <TableCell>{course.categoryName}</TableCell>
                        <TableCell>
                          <Badge variant={course.isApproved ? "success" : "warning"}>
                            {course.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!course.isApproved && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate({ courseId: course.courseId, approve: true })}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/5"
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate({ courseId: course.courseId, approve: false })}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {allCourses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                          No courses found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments Tab Content */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Global Enrollments</CardTitle>
              <CardDescription>View and manage all student enrollments across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {isEnrollLoading ? (
                <div className="py-10 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" /> Loading enrollments...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.enrollmentId}>
                        <TableCell className="font-mono text-xs">#{enrollment.enrollmentId}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{enrollment.studentName}</span>
                            <span className="text-[10px] text-muted-foreground">{enrollment.studentId}</span>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.courseTitle}</TableCell>
                        <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            disabled={deleteEnrollmentMutation.isPending}
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this enrollment?")) {
                                deleteEnrollmentMutation.mutate(enrollment.enrollmentId);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allEnrollments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                          No enrollments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  User,
  DollarSign,
  Trash2,
  Plus,
  Eye,
  Filter,
} from "lucide-react";
import api from "@/api/axios";
import courseService from "@/api/course";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getFullUrl } from "@/lib/urlHelper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const AdminCourses = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch Pending Courses
  const { 
    data: pendingResponse, 
    isLoading: isPendingLoading,
    isError: isPendingError,
    error: pendingError 
  } = useQuery({
    queryKey: ["admin", "courses", "pending"],
    queryFn: () => courseService.getPending(),
    retry: false
  });

  // Fetch All Courses
  const { 
    data: allResponse, 
    isLoading: isAllLoading 
  } = useQuery({
    queryKey: ["admin", "courses", "all"],
    queryFn: () => courseService.getAll({ pageSize: 100 }),
  });

  const pendingCourses = pendingResponse?.data?.data || pendingResponse?.data || (Array.isArray(pendingResponse) ? pendingResponse : []);
  const allCourses = allResponse?.data?.data || allResponse?.data || (Array.isArray(allResponse) ? allResponse : []);

  const updateCourseStatusMutation = useMutation({
    mutationFn: async ({ courseId, status }) => {
      return await courseService.approve(courseId, {
        isApproved: status === "Approved",
        rejectionReason:
          status === "Approved"
            ? ""
            : "Course content does not meet guidelines",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "courses"]);
      toast.success("Course status updated successfully");
    },
    onError: () => toast.error("Failed to update course status"),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId) => courseService.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "courses"]);
      toast.success("Course deleted successfully");
    },
    onError: () => toast.error("Failed to delete course"),
  });

  const isNoPendingError = isPendingError && pendingError.response?.status === 400;

  if (isPendingLoading || isAllLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const CourseTable = ({ courses, isPendingView }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.courseId || course.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <img
                  src={getFullUrl(course.imagePath || course.imgPath)}
                  alt={course.title}
                  className="w-10 h-10 object-cover rounded bg-muted"
                />
                <span className="truncate max-w-[200px]">{course.title}</span>
              </div>
            </TableCell>
            <TableCell>{course.instructorName || "Unknown"}</TableCell>
            <TableCell>${course.price}</TableCell>
            <TableCell>
               <Badge variant={course.isApproved ? "success" : "warning"}>
                  {course.isApproved ? "Approved" : "Pending"}
               </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              {isPendingView ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 h-8 w-8 p-0"
                    onClick={() =>
                      updateCourseStatusMutation.mutate({
                        courseId: course.id,
                        status: "Approved",
                      })
                    }
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 h-8 w-8 p-0"
                    onClick={() =>
                      updateCourseStatusMutation.mutate({
                        courseId: course.id,
                        status: "Rejected",
                      })
                    }
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => navigate(`/course/${course.courseId || course.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive h-8 w-8 p-0"
                onClick={() => {
                   if(confirm("Are you sure you want to delete this course?")) {
                      deleteCourseMutation.mutate(course.courseId || course.id);
                   }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {courses.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
              No courses found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Review, edit, and manage all courses on the platform</p>
        </div>
        <Button onClick={() => navigate("/dashboard/create-course")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="pending">Pending Review ({pendingCourses.length})</TabsTrigger>
          <TabsTrigger value="all">All Courses ({allCourses.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>New courses waiting for administrative approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isNoPendingError ? (
                <div className="h-32 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                  Great! All courses have been reviewed.
                </div>
              ) : (
                <CourseTable courses={pendingCourses} isPendingView={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Catalog</CardTitle>
              <CardDescription>Every course currently published on LearnHub</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseTable courses={allCourses} isPendingView={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCourses;

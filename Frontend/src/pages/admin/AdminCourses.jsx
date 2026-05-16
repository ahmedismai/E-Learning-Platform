import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import api from "@/api/axios";
import courseService from "@/api/course";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const AdminCourses = () => {
  const queryClient = useQueryClient();

  // دالة واحدة موحدة للـ URL
  const getFullUrl = (path) => {
    if (!path || path === "No Image Available") return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    const backendUrl = import.meta.env.PROD 
    ? "http://e-learning-platform-3.runasp.net" 
    : (import.meta.env.VITE_API_URL || "").replace("/api", "");

  return `${backendUrl}/Images/Course/${path.replace(/\\/g, "/")}`;
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => courseService.getPending(),
  });

  const courses = response?.data || [];

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Courses</CardTitle>
        <CardDescription>Review and manage course submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={getFullUrl(course.imagePath)}
                      alt={course.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                    {course.title}
                  </div>
                </TableCell>
                <TableCell>{course.instructorName || "Unknown"}</TableCell>
                <TableCell>${course.price}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() =>
                      updateCourseStatusMutation.mutate({
                        courseId: course.id,
                        status: "Approved",
                      })
                    }
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() =>
                      updateCourseStatusMutation.mutate({
                        courseId: course.id,
                        status: "Rejected",
                      })
                    }
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500"
                    onClick={() => deleteCourseMutation.mutate(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminCourses;

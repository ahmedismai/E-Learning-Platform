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
import { Users, BookOpen, Calendar, Trash2, Loader2, Search } from "lucide-react";
import enrollmentService from "@/api/enrollment";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AdminEnrollments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: enrollmentsResponse = {}, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "enrollments"],
    queryFn: () => enrollmentService.getAll(),
    retry: false
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => enrollmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "enrollments"]);
      toast({ title: "Enrollment removed successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  });

  const enrollments = enrollmentsResponse.data || [];
  
  const filteredEnrollments = enrollments.filter(e => 
    e.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8"><Skeleton className="h-80 w-full" /></div>;

  // Handle No Found error from API (400 or 404 with success: false)
  const isNoDataError = isError && (error.response?.data?.success === false);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Global Enrollments</h1>
          <p className="text-muted-foreground mt-1">View and manage all student-course relationships</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search student or course..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Active Enrollments
          </CardTitle>
          <CardDescription>Comprehensive list of free and paid enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {isNoDataError || filteredEnrollments.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
               <Users className="w-8 h-8 mb-2 opacity-20" />
               <p>{isNoDataError ? error.response?.data?.message : "No enrollments found matching your criteria."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((e) => (
                  <TableRow key={e.enrollmentId} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{e.studentName || "Unknown Student"}</div>
                      <div className="text-[10px] text-muted-foreground">{e.studentEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{e.courseTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(e.enrollmentDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${e.progress || 0}%` }}
                            />
                         </div>
                         <span className="text-xs font-bold">{e.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          if (confirm("Remove this enrollment? The student will lose access.")) {
                            deleteMutation.mutate(e.enrollmentId);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEnrollments;

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
import { CreditCard, DollarSign, History, User, BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import orderService from "@/api/order";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AdminPayments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersResponse = {}, isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => orderService.getAll(),
  });

  const orders = ordersResponse.data || [];

  const reviewMutation = useMutation({
    mutationFn: (reviewData) => orderService.review(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "payments"]);
      toast({ title: "Order status updated successfully!" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  });

  const totalRevenue = orders
    .filter(o => o.status === "Approved")
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  if (isLoading) return <div className="p-8"><Skeleton className="h-80 w-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve course purchase requests</p>
        </div>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 px-6 flex items-center gap-4">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Transaction Requests
          </CardTitle>
          <CardDescription>Manage enrollment requests for paid courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.orderId} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                        {o.studentName ? o.studentName[0] : "U"}
                      </div>
                      <div className="flex flex-col">
                         <span>{o.studentName || "Unknown Student"}</span>
                         <span className="text-[10px] text-muted-foreground">ID: {o.studentId?.substring(0,8) || "N/A"}...</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <BookOpen className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{o.courseTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">${o.price}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        o.status === "Approved" ? "success" : 
                        o.status === "Pending" ? "warning" : "destructive"
                      }
                    >
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {o.status === "Pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => reviewMutation.mutate({ orderId: o.orderId, isApproved: true, rejectionReason: "" })}
                          disabled={reviewMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/5"
                          onClick={() => {
                            const reason = window.prompt("Rejection reason:", "Payment not verified");
                            if (reason !== null) {
                              reviewMutation.mutate({ orderId: o.orderId, isApproved: false, rejectionReason: reason });
                            }
                          }}
                          disabled={reviewMutation.isPending}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Processed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                       No orders found in the platform history.
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

export default AdminPayments;

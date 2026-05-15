import { useQuery } from "@tanstack/react-query";
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
import { History, BookOpen, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import orderService from "@/api/order";
import { Skeleton } from "@/components/ui/skeleton";

const MyOrders = () => {
  const { data: ordersResponse = {}, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderService.getMyOrders(),
  });

  const orders = ordersResponse.data || [];

  if (isLoading) return <div className="p-8"><Skeleton className="h-80 w-full" /></div>;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Rejected": return <XCircle className="w-4 h-4 text-destructive" />;
      case "Pending": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Order History</h1>
        <p className="text-muted-foreground mt-1">Track your course purchase requests and their status</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Orders
          </CardTitle>
          <CardDescription>A detailed list of your course enrollment attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reviewed At</TableHead>
                <TableHead className="max-w-[200px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.orderId} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate max-w-[250px]">{o.courseTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">${o.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(o.status)}
                      <Badge 
                        variant={
                          o.status === "Approved" ? "success" : 
                          o.status === "Pending" ? "warning" : "destructive"
                        }
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {o.reviewedAt ? new Date(o.reviewedAt).toLocaleDateString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-sm italic text-muted-foreground max-w-[200px] truncate">
                    {o.status === "Rejected" ? o.rejectionReason : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <History className="w-8 h-8 opacity-20" />
                      <p>You haven't placed any orders yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
        <div className="text-sm text-amber-800 space-y-1">
          <p className="font-bold">Important Note:</p>
          <p>Paid courses require manual verification of payment. Once you place an order, our admins will review your transaction. This usually takes 12-24 hours. You will gain access to the course content automatically once your order is marked as <span className="font-bold">Approved</span>.</p>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

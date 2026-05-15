import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import api from "@/api/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { getFullUrl } from "@/lib/urlHelper";

const AdminOverview = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboards/AdminDashboard");
      return response.data;
    },
  });

  const stats = response?.stats;

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      sub: `${stats?.totalStudents || 0} Students, ${stats?.totalInstructors || 0} Instructors`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      sub: `${stats?.totalEnrollments || 0} Total Enrollments`,
      icon: BookOpen,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Pending Courses",
      value: stats?.pendingCourses || 0,
      sub: "Awaiting approval",
      icon: Activity,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Total Revenue",
      value: "N/A",
      sub: "Payment tracking disabled",
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Platform Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Global statistics and platform health metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Recent Active Users
            </CardTitle>
            <CardDescription>
              Last student activity on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {response?.recentActiveUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {user.fullName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Last Activity</p>
                    <p className="text-xs">{new Date(user.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {!response?.recentActiveUsers?.length && (
                 <p className="text-sm text-muted-foreground italic text-center py-4">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Rated Courses
            </CardTitle>
            <CardDescription>
              Highest performing content by rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {response?.topCourses?.map((course) => (
                 <div key={course.courseId} className="flex items-center gap-4 p-2 border rounded-xl">
                   <img 
                     src={getFullUrl(course.courseImage)} 
                     alt={course.title}
                     className="w-12 h-12 rounded-lg object-cover"
                   />
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold truncate">{course.title}</p>
                     <div className="flex items-center gap-1 text-xs text-amber-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{course.averageRating.toFixed(1)} Rating</span>
                     </div>
                   </div>
                 </div>
               ))}
               {!response?.topCourses?.length && (
                 <p className="text-sm text-muted-foreground italic text-center py-4">No top courses yet.</p>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

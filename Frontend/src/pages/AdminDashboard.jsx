import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Trash2,
  Loader2,
  Layers,
  History,
  Plus,
  Pencil,
} from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({ name: "", description: "", image: null });

  // Fetch Admin Dashboard Data
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await api.get("/Dashboards/AdminDashboard");
      return response.data;
    },
  });

  const stats = dashboardData?.stats;

  // Fetch Users
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get("/Account/Users");
      return response.data;
    },
  });

  const users = usersResponse?.data || [];

  // Fetch Courses (pending for approval)
  const { data: pendingCoursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin", "pending-courses"],
    queryFn: async () => {
      const response = await api.get("/Course/pending");
      return response.data;
    },
  });

  const pendingCourses = pendingCoursesResponse?.data || [];

  // Fetch Categories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const response = await api.get("/Category");
      return response.data;
    },
  });

  const categories = categoriesResponse?.data || [];

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      // The backend uses Role/AssignRole and Role/UnAssignRole or similar
      // For simplicity, we'll try AssignRole
      return await api.post(`/Role/AssignRole/${userId}/${role}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("User role updated successfully");
    },
    onError: () => toast.error("Failed to update user role"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await api.delete(`/Account/DeleteUser/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("User deleted successfully");
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const approveCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      return await api.patch(`/Course/${courseId}/approve`, { isApproved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "pending-courses"]);
      queryClient.invalidateQueries(["admin", "stats"]);
      toast.success("Course approved");
    },
    onError: () => toast.error("Failed to approve course"),
  });

  const categoryMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("CategoryName", data.name);
      fd.append("Description", data.description);
      if (data.image) fd.append("ImgURL", data.image);

      if (editingCategory) {
        return await api.patch(`/Category/${editingCategory.categoryId}`, fd);
      }
      return await api.post("/Category", fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "categories"]);
      toast.success(`Category ${editingCategory ? "updated" : "created"} successfully`);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryData({ name: "", description: "", image: null });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Operation failed"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/Category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "categories"]);
      toast.success("Category deleted");
    },
  });

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.defaults.baseURL.replace("/api", "");
    return `${baseUrl}/${path.replace(/\\/g, "/")}`;
  };

  const isLoading = statsLoading || usersLoading || coursesLoading || categoriesLoading;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, courses, and platform health
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 w-full lg:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Approvals</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">
                        {stats?.totalUsers}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Courses
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">
                        {stats?.totalCourses}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending Courses
                    </p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold mt-1 text-amber-500">
                        {stats?.pendingCourses}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <History className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>
                Courses with the highest ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.topCourses?.map((course) => (
                      <TableRow key={course.courseId}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>
                           <Badge variant="secondary">{course.averageRating.toFixed(1)} ★</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Organize courses into topics</CardDescription>
              </div>
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCategory(null);
                    setCategoryData({ name: "", description: "", image: null });
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit" : "Create"} Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        value={categoryData.name} 
                        onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                        placeholder="e.g. Web Development"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={categoryData.description}
                        onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                        placeholder="Brief overview of the category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCategoryData({ ...categoryData, image: e.target.files[0] })}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => categoryMutation.mutate(categoryData)}
                      disabled={categoryMutation.isPending}
                    >
                      {categoryMutation.isPending ? "Saving..." : "Save Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.categoryId}>
                        <TableCell>
                          <img src={getFullUrl(cat.imgPath)} className="w-10 h-10 rounded-full object-cover" alt="" />
                        </TableCell>
                        <TableCell className="font-bold">{cat.categoryName}</TableCell>
                        <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingCategory(cat);
                                setCategoryData({ name: cat.categoryName, description: cat.description || "", image: null });
                                setIsCategoryModalOpen(true);
                              }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this category?")) deleteCategoryMutation.mutate(cat.categoryId);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Display all users and apply role-based access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.userId}>
                        <TableCell className="font-medium">
                          {u.fullName}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.roles?.map(role => (
                              <Badge
                                key={role}
                                variant={
                                  role === "Admin"
                                    ? "destructive"
                                    : role === "Instructor"
                                      ? "warning"
                                      : "secondary"
                                }
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!u.roles?.includes("Admin") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: u.userId,
                                    role: "Admin",
                                  })
                                }
                              >
                                Make Admin
                              </Button>
                            )}
                            {!u.roles?.includes("Instructor") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    userId: u.userId,
                                    role: "Instructor",
                                  })
                                }
                              >
                                Make Instructor
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user?")) {
                                  deleteUserMutation.mutate(u.userId);
                                }
                              }}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Approvals</CardTitle>
              <CardDescription>
                Approve or reject courses submitted by instructors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
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
                    {pendingCourses.map((course) => (
                      <TableRow key={course.courseId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getFullUrl(course.imgPath)}
                              className="w-10 h-7 rounded object-cover"
                              alt=""
                            />
                            <span className="font-medium">{course.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.instructorName || "Unknown"}
                        </TableCell>
                        <TableCell>${course.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              className="gap-1"
                              onClick={() =>
                                approveCourseMutation.mutate(course.courseId)
                              }
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

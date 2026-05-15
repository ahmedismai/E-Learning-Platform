import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import courseService from "@/api/course";
import { enrollmentService } from "@/api/enrollment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Users, Star, Play, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getFullUrl } from "@/lib/urlHelper";

const BrowseCourses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/Category/List");
      return response.data;
    },
  });

  const { data: coursesResponse, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses", searchTerm, selectedCategoryId],
    queryFn: async () => {
      let response;
      if (!selectedCategoryId) {
        response = await courseService.getAll({ name: searchTerm, pageSize: 100 });
      } else {
        response = await courseService.getByCategory(selectedCategoryId);
      }
      return response;
    },
  });

  const { data: enrollmentsResponse = { data: [] } } = useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      try {
        const response = await enrollmentService.getByStudent(user.id);
        return response;
      } catch (error) {
        if (error.response?.status === 404) {
          return { success: true, data: [] };
        }
        throw error;
      }
    },
    enabled: !!user && (user?.role === "Student" || user?.role === "Admin"),
  });

  const enrollments = enrollmentsResponse.data || [];

  const isEnrolled = (courseId) => {
    return enrollments.some((e) => e.courseId === courseId);
  };

  const categories = categoriesResponse?.data || [];
  const courses = coursesResponse?.data?.data || coursesResponse?.data || [];

  const getFullUrl = (path) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    const baseUrl = api.defaults.baseURL.replace("/api", "");
    return `${baseUrl}/Images/Course/${path.replace(/\\/g, "/")}`;
  };

  if (isCoursesLoading || isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
        <h1 className="text-4xl font-bold text-foreground mb-4">Discover Your Next Skill</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Browse through our extensive catalog of professional courses led by industry experts.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for courses, topics, or instructors..."
            className="pl-10 h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            className="rounded-xl h-12"
            onClick={() => setSelectedCategoryId(null)}
          >
            All Courses
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.categoryId}
              variant={selectedCategoryId === cat.categoryId ? "default" : "outline"}
              className="rounded-xl h-12 whitespace-nowrap"
              onClick={() => setSelectedCategoryId(cat.categoryId)}
            >
              {cat.categoryName}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Card key={course.courseId} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-white">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={getFullUrl(course.imgPath)}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              <Badge className="absolute top-3 right-3 bg-white/90 text-primary border-none shadow-sm backdrop-blur-sm">
                {course.categoryName}
              </Badge>
            </div>
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current opacity-50" />
                <span className="text-xs font-bold text-slate-400 ml-1">(4.0)</span>
              </div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {course.instructorName}
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Price</span>
                  <span className="text-xl font-black text-slate-900">
                    {course.price === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `$${course.price}`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                   <Users className="w-4 h-4" />
                   <span className="text-xs font-bold">{course.enrolledCount || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role === "Instructor" && course.instructorId === user.id ? (
                  <Button asChild variant="outline" className="w-full rounded-xl font-bold border-primary/20 hover:bg-primary/5">
                    <Link to={`/dashboard/courses/${course.courseId}`}>
                      Manage Course
                    </Link>
                  </Button>
                ) : isEnrolled(course.courseId) ? (
                  <Button asChild className="w-full rounded-xl font-bold shadow-glow hover:shadow-none bg-green-500 hover:bg-green-600">
                    <Link to={`/dashboard/courses/${course.courseId}`} className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" />
                      Continue
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full rounded-xl font-bold shadow-glow hover:shadow-none">
                    <Link to={`/courses/${course.courseId}`}>View Details</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;

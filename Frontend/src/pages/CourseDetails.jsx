import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Clock,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  PlusCircle,
  ClipboardList,
  MessageSquare,
  Star,
  GraduationCap,
  Loader2,
} from "lucide-react";

// استيراد مكونات UI الخاصة بـ shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// استيراد مكون الـ AIQuizDialog والخدمات
import AIQuizDialog from "./AIQuizDialog";
import { courseService } from "@/services/courseService";
import { reviewService } from "@/services/reviewService";
import { enrollmentService } from "@/services/enrollmentService";
import { lessonProgressService } from "@/services/lessonProgressService";
import { examService } from "@/services/examService";
import { orderService } from "@/services/orderService";
import { lessonService } from "@/services/lessonService";
import { sectionService } from "@/services/sectionService";

const CourseDetails = () => {
  const [activeLesson, setActiveLesson] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Helpers ---
  // تعديل الـ Helper للتعامل مع الروابط الكاملة الجاية من الباك إند (runasp.net)
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://e-learning-platform-3.runasp.net/${path}`;
  };

  // Queries
  const { data: courseResponse, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => courseService.getById(id),
  });

  const course = courseResponse?.data;
  const sections = course?.sections || [];

  const { data: reviewsResponse } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewService.getAllByCourse(id),
  });

  const reviews = reviewsResponse?.data || [];

  const { data: enrollmentsResponse } = useQuery({
    queryKey: ["enrollments", "me"],
    queryFn: () => enrollmentService.getByStudent(user.id),
    enabled: !!user && (user.role === "Student" || user.role === "Admin"),
  });

  const enrollments = enrollmentsResponse?.data || [];
  const currentEnrollment = enrollments.find(
    (e) => e.courseId === parseInt(id),
  );
  const isStudentEnrolled = !!currentEnrollment;
  const isInstructor =
    user?.role === "Instructor" && course?.instructorId === user?.id;
  const hasAccess = isInstructor || isStudentEnrolled || user?.role === "Admin";

  const { data: progressResponse } = useQuery({
    queryKey: ["progress", currentEnrollment?.enrollmentId],
    queryFn: () =>
      lessonProgressService.getProgress(currentEnrollment.enrollmentId),
    enabled: !!currentEnrollment,
  });

  const progressData = progressResponse?.data;

  // Fetch Exams for this course
  const { data: examsResponse } = useQuery({
    queryKey: ["course-exams", id],
    queryFn: () => examService.getByCourse(id),
    enabled: hasAccess,
  });
  const courseExams = examsResponse?.data || [];

  // Mutations
  const addReviewMutation = useMutation({
    mutationFn: (newReview) => reviewService.create(newReview),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id]);
      toast({ title: "Review submitted successfully!" });
      setIsReviewing(false);
      setReview({ rating: 5, comment: "" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (studentId) => reviewService.delete(id, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id]);
      toast({ title: "Review deleted successfully!" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete review",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: (sectionData) => sectionService.create(sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", id]);
      toast({ title: "Section added successfully!" });
      setIsAddingSection(false);
      setNewSection({ title: "" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add section",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, title }) =>
      sectionService.update(sectionId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", id]);
      toast({ title: "Section updated successfully!" });
      setIsAddingSection(false);
      setIsEditingSection(false);
      setSelectedSection(null);
      setNewSection({ title: "" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update section",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId) => sectionService.delete(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["course", id]);
      toast({ title: "Section deleted successfully!" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete section",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast({
          title: "Please login to continue",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (course.isFree) {
        return enrollmentService.create({
          courseId: parseInt(id),
          studentId: user.id,
        });
      }

      return orderService.create({
        courseId: parseInt(id),
        studentId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["enrollments", "me"]);
      queryClient.invalidateQueries(["course", id]);
      queryClient.invalidateQueries(["my-orders"]);

      toast({
        title: course.isFree
          ? "Enrolled successfully! Enjoy your course."
          : "Order created successfully! Wait for admin approval.",
      });

      if (course.isFree && sections[0]?.lessons[0]) {
        setActiveLesson(sections[0].lessons[0]);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: course.isFree ? "Enrollment failed" : "Order creation failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId) =>
      lessonProgressService.completeLesson({
        enrollmentId: currentEnrollment.enrollmentId,
        lessonId: lessonId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries([
        "progress",
        currentEnrollment?.enrollmentId,
      ]);
      queryClient.invalidateQueries(["student-dashboard"]);
      toast({ title: "Lesson marked as completed!" });
    },
    onError: (error) => {
      if (error.response?.data?.message !== "Lesson already completed") {
        toast({
          variant: "destructive",
          title: "Failed to update progress",
          description: error.response?.data?.message,
        });
      }
    },
  });

  // ربط دالة التحقق من إكمال الدرس ببيانات الـ progress الفعيلة
  const isLessonCompleted = (lessonId) => {
    if (!progressData?.completedLessons) return false;
    return progressData.completedLessons.includes(lessonId);
  };

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [quickAddCount, setQuickAddCount] = useState(5);

  // Review State
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });

  // Lesson Management State
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    lessonType: "Video",
    mediaFile: null,
    sectionId: "",
    duration: 10,
  });

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newSection, setNewSection] = useState({ title: "" });

  const handleSaveSection = async () => {
    if (!newSection.title) return;
    if (isEditingSection && selectedSection) {
      updateSectionMutation.mutate({
        sectionId: selectedSection.sectionId,
        title: newSection.title,
      });
    } else {
      addSectionMutation.mutate({
        courseId: parseInt(id),
        title: newSection.title,
      });
    }
  };

  const openEditSection = (section) => {
    setSelectedSection(section);
    NewSection({ title: section.title });
    SetIsEditingSection(true);
    SetIsAddingSection(true);
  };

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.sectionId) return;
    setIsUploading(true);
    try {
      const targetSection = sections.find(
        (s) => String(s.sectionId || s.id) === String(newContent.sectionId),
      );
      const currentLessonsCount = targetSection?.lessons?.length || 0;
      const nextOrder = currentLessonsCount + 1;

      let finalOrder = nextOrder;
      if (isEditingLesson && selectedLesson) {
        finalOrder = selectedLesson.order || selectedLesson.Order || 1;
      }
      if (finalOrder < 1) finalOrder = 1;

      const formData = new FormData();
      formData.append("sectionId", newContent.sectionId);
      formData.append("title", newContent.title.trim());

      if (newContent.mediaFile) {
        formData.append("file", newContent.mediaFile);
      }

      formData.append("lessonType", newContent.lessonType);
      formData.append("durationInMinutes", String(newContent.duration || 10));
      formData.append("order", String(finalOrder));

      if (isEditingLesson && selectedLesson) {
        await lessonService.update(selectedLesson.lessonId, formData);
        toast({ title: "Lesson updated successfully!" });
      } else {
        await lessonService.create(formData);
        toast({ title: "Lesson added successfully!" });
      }

      queryClient.invalidateQueries(["course", id]);
      setIsAddingContent(false);
      setIsEditingLesson(false);
      setSelectedLesson(null);
      setNewContent({
        title: "",
        lessonType: "Video",
        mediaFile: null,
        sectionId: "",
        duration: 10,
      });
    } catch (error) {
      console.error("Validation Error Details:", error.response?.data);
      toast({
        variant: "destructive",
        title: isEditingLesson
          ? "Failed to update lesson"
          : "Failed to add lesson",
        description:
          error.response?.data?.errors?.Order?.[0] ||
          error.response?.data?.title ||
          "Validation Error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await lessonService.delete(lessonId);
      queryClient.invalidateQueries(["course", id]);
      toast({ title: "Lesson deleted successfully!" });
      if (activeLesson?.lessonId === lessonId) setActiveLesson(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete lesson" });
    }
  };

  const openEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setNewContent({
      title: lesson.title,
      lessonType: lesson.lessonType || "Video",
      mediaFile: null,
      sectionId: String(lesson.sectionId),
      duration: lesson.durationInMinutes || 10,
    });
    setIsEditingLesson(true);
    setIsAddingContent(true);
  };

  if (isCourseLoading || isUploading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin inline mr-2" />
        Loading...
      </div>
    );
  }

  if (!course) {
    return <div className="p-8 text-center">Course not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1">
              {course.categoryName}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap gap-6 pt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">
                  {course.instructorName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>
                  {sections.reduce(
                    (acc, s) => acc + (s.lessons?.length || 0),
                    0,
                  )}{" "}
                  lessons
                </span>
              </div>
            </div>
          </div>

          <div className="aspect-video relative rounded-2xl overflow-hidden bg-black border shadow-sm">
            {hasAccess && activeLesson ? (
              <video
                key={activeLesson.lessonId}
                src={getFullUrl(activeLesson.contentUrl)}
                controls
                className="w-full h-full"
                autoPlay
                onEnded={() =>
                  !isLessonCompleted(activeLesson.lessonId) &&
                  completeLessonMutation.mutate(activeLesson.lessonId)
                }
              />
            ) : (
              <div className="relative w-full h-full">
                {course.imgPath ? (
                  <img
                    src={getFullUrl(course.imgPath)}
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-16 h-16 text-white/80" />
                </div>
              </div>
            )}
          </div>

          <Card className="border-none shadow-md">
            {isStudentEnrolled && currentEnrollment && (
              <div className="p-6 bg-primary/5 border-b space-y-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Progress</span>
                  <span>{currentEnrollment.progress}%</span>
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${currentEnrollment.progress}%` }}
                  />
                </div>
              </div>
            )}
            <CardHeader className="border-b">
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sections.length > 0 ? (
                sections.map((section) => (
                  <div
                    key={section.sectionId}
                    className="p-5 border-b last:border-0 group/section"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{section.title}</h3>
                      {isInstructor && (
                        <div className="flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary"
                            onClick={() => openEditSection(section)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (
                                confirm("Delete section and all its lessons?")
                              ) {
                                deleteSectionMutation.mutate(section.sectionId);
                              }
                            }}
                            disabled={deleteSectionMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {section.lessons?.map((lesson, idx) => (
                        <div
                          key={lesson.lessonId}
                          className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all ${
                            activeLesson?.lessonId === lesson.lessonId
                              ? "bg-primary/5 border-l-4 border-primary"
                              : "hover:bg-accent/5"
                          }`}
                          onClick={() => {
                            if (hasAccess) {
                              const type = lesson.lessonType?.toLowerCase();

                              if (type === "video") {
                                setActiveLesson(lesson);
                              } else if (type === "pdf" || type === "text") {
                                const fileUrl =
                                  lesson.contentUrl ||
                                  lesson.pdfUrl ||
                                  lesson.fileUrl;

                                if (fileUrl) {
                                  const fullUrl = getFullUrl(fileUrl);

                                  const newWindow = window.open(
                                    fullUrl,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );

                                  if (!newWindow) {
                                    window.location.href = fullUrl;
                                  }
                                } else {
                                  console.error(
                                    "عفواً، لم يتم العثور على رابط الملف في البيانات:",
                                    lesson,
                                  );
                                  alert(
                                    "رابط الملف الخاص بهذا الدرس غير متوفر.",
                                  );
                                }
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isLessonCompleted(lesson.lessonId)
                                  ? "bg-green-500 text-white"
                                  : "bg-muted"
                              }`}
                            >
                              {isLessonCompleted(lesson.lessonId) ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{lesson.title}</p>
                              <Badge variant="outline" className="text-[10px]">
                                {lesson.lessonType === "Video"
                                  ? "Video"
                                  : lesson.lessonType === "PDF"
                                    ? "PDF"
                                    : "Text"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isInstructor && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditLesson(lesson);
                                  }}
                                >
                                  <PlusCircle className="w-4 h-4 rotate-45" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson.lessonId);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {isStudentEnrolled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  isLessonCompleted(lesson.lessonId) ||
                                  completeLessonMutation.isPending
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeLessonMutation.mutate(
                                    lesson.lessonId,
                                  );
                                }}
                              >
                                {isLessonCompleted(lesson.lessonId)
                                  ? "Completed"
                                  : "Mark Done"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No content available for this course.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="border-none shadow-md">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Student
                Reviews
              </CardTitle>
              {isStudentEnrolled && !isInstructor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewing(true)}
                >
                  Write a Review
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div
                      key={i}
                      className="flex gap-4 border-b last:border-0 pb-6 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {r.studentName?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{r.studentName}</h4>
                            <div className="flex items-center gap-1 my-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < r.rating ? "text-amber-500 fill-amber-500" : "text-muted"}`}
                                />
                              ))}
                            </div>
                          </div>
                          {(user?.id === r.studentId ||
                            user?.role === "Admin") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                deleteReviewMutation.mutate(r.studentId)
                              }
                              disabled={deleteReviewMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm italic text-muted-foreground mt-2">
                          "{r.comment}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-2 shadow-xl">
            {!hasAccess ? (
              <>
                <div className="bg-primary/5 p-8 text-center border-b">
                  <span className="text-4xl font-bold text-primary">
                    ${course.price}
                  </span>
                </div>
                <CardContent className="p-8">
                  <Button
                    className="w-full py-6 text-lg font-bold"
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending
                      ? "Processing..."
                      : course.isFree
                        ? "Enroll Now"
                        : "Create Order"}
                  </Button>
                </CardContent>
              </>
            ) : isInstructor ? (
              <CardContent className="p-8 space-y-4">
                <h3 className="text-xl font-bold text-center">
                  Instructor Control
                </h3>
                <AIQuizDialog
                  courseId={id}
                  mode="instructor"
                  buttonText="AI Course Builder"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingSection(true)}
                >
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingContent(true)}
                >
                  Add Lesson
                </Button>
                <div className="pt-4 border-t space-y-3">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link to={`/dashboard/create-exam?courseId=${id}`}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Create Final Exam
                    </Link>
                  </Button>
                  {courseExams.length > 0 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/dashboard/student-results/${id}`}>
                        <ClipboardList className="w-4 h-4 mr-2" /> View Exam
                        Results
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">You're Enrolled!</h3>
                <AIQuizDialog
                  courseId={id}
                  mode="student"
                  buttonText="AI Study Companion"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboard/my-courses")}
                >
                  My Courses
                </Button>

                {progressData?.canTakeExam && courseExams.length > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" /> Course
                      Completed!
                    </p>
                    {courseExams.map((exam) => (
                      <Button
                        key={exam.examId}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-lg shadow-primary/20"
                        asChild
                      >
                        <Link to={`/dashboard/exam/${exam.examId}?type=exam`}>
                          <Play className="w-4 h-4 mr-2" /> Take Final Exam:{" "}
                          {exam.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

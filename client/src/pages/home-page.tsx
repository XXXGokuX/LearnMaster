import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/ui/dashboard-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, Enrollment } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", user?.id], // Make query key user-specific
    enabled: !!user, // Only fetch enrollments if user is logged in
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", "/api/enroll", { courseId });
    },
    onSuccess: () => {
      // Invalidate enrollments for the specific user
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments", user?.id] });
      toast({
        title: "Enrolled successfully",
        description: "You can now start learning!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enroll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a Set of enrolled course IDs for efficient lookup
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  if (isLoadingCourses || isLoadingEnrollments) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{course.description}</p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Category:</span> {course.category}</p>
                  <p className="text-sm"><span className="font-medium">Level:</span> {course.level}</p>
                  <p className="text-sm"><span className="font-medium">Duration:</span> {course.duration}</p>
                </div>
              </CardContent>
              <CardFooter>
                {enrolledCourseIds.has(course.id) ? (
                  <Link href={`/course/${course.id}`}>
                    <Button className="w-full">Continue Learning</Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
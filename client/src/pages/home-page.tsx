import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/ui/dashboard-nav";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", "/api/enroll", { courseId });
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully",
        description: "You can now start learning!",
      });
    },
  });

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.courseId));

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
                <div className="mt-4">
                  <p className="font-semibold">${course.price / 100}</p>
                </div>
                {enrolledCourseIds.has(course.id) && (
                  <div className="mt-4">
                    <Progress
                      value={
                        enrollments?.find((e) => e.courseId === course.id)
                          ?.progress ?? 0
                      }
                    />
                  </div>
                )}
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
                    Enroll Now
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

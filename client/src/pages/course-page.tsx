import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, Enrollment } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const { user } = useAuth();
  const { toast } = useToast();

  const courseId = parseInt(params?.id ?? "0");

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", user?.id],
    enabled: !!user?.id,
  });

  const enrollment = enrollments?.find((e) => e.courseId === courseId);

  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", "/api/progress", {
        courseId,
        progress,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments", user?.id] });
      toast({
        title: "Progress saved",
        description: "Your progress has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save progress",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoadingCourse || isLoadingEnrollments) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <Progress value={enrollment.progress} />
            <p className="text-sm text-gray-600 mt-2">Progress: {enrollment.progress}%</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Course Content</TabsTrigger>
                  <TabsTrigger value="info">Course Info</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <div className="space-y-4">
                    {course.content.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg border"
                      >
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        {item.type === "video" && item.url && (
                          <div className="space-y-4">
                            <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
                              <video 
                                controls 
                                className="absolute inset-0 w-full h-full object-contain"
                                src={item.url}
                                preload="metadata"
                                controlsList="nodownload"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <Button
                              onClick={() =>
                                progressMutation.mutate(
                                  Math.min(
                                    100,
                                    enrollment.progress +
                                      100 / course.content.length,
                                  ),
                                )
                              }
                              disabled={progressMutation.isPending}
                            >
                              {progressMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating Progress...
                                </>
                              ) : (
                                "Mark as Complete"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="info">
                  <div className="prose">
                    <p>{course.description}</p>
                    <h3>Course Structure</h3>
                    <ul>
                      {course.content.map((item, index) => (
                        <li key={index}>
                          {item.title} ({item.type})
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
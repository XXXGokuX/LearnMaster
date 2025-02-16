import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/ui/dashboard-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const { user } = useAuth();
  const { toast } = useToast();

  const courseId = parseInt(params?.id ?? "0");

  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: enrollments } = useQuery({
    queryKey: ["/api/enrollments"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Progress saved",
        description: "Your progress has been updated.",
      });
    },
  });

  if (!course || !enrollment) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <Progress value={enrollment.progress} />
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
                        {item.type === "video" && (
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
                          >
                            Mark as Complete
                          </Button>
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

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
import { Loader2, CheckCircle2, Play } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useState } from 'react';
import { motion } from "framer-motion";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const { user } = useAuth();
  const { toast } = useToast();

  const courseId = parseInt(params?.id ?? "0");
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

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

  const calculateLectureProgress = (index: number) => {
    const lectureIncrement = 100 / course.content.length;
    const currentProgress = enrollment.progress;
    const lectureProgress = Math.min(100, Math.max(0, currentProgress - (index * lectureIncrement)));
    return lectureProgress >= lectureIncrement;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <Progress value={enrollment.progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">Overall Progress: {enrollment.progress}%</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lecture List */}
            <Card className="lg:col-span-1 h-fit">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                <div className="space-y-2">
                  {course.content.map((lecture, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        variant={activeVideoIndex === index ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveVideoIndex(index)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {calculateLectureProgress(index) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium">Lecture {index + 1}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {lecture.title}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video Player and Content */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <Tabs defaultValue="video">
                  <TabsList>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                  </TabsList>

                  <TabsContent value="video">
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          key={course.content[activeVideoIndex].url}
                          controls
                          className="w-full h-full"
                          src={course.content[activeVideoIndex].url}
                          preload="metadata"
                          controlsList="nodownload"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                          {course.content[activeVideoIndex].title}
                        </h3>
                        <p className="text-muted-foreground">
                          {course.content[activeVideoIndex].description}
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          progressMutation.mutate(
                            Math.min(
                              100,
                              ((activeVideoIndex + 1) * 100) / course.content.length
                            )
                          )
                        }
                        disabled={progressMutation.isPending || calculateLectureProgress(activeVideoIndex)}
                      >
                        {progressMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Progress...
                          </>
                        ) : calculateLectureProgress(activeVideoIndex) ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          "Mark as Complete"
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="description">
                    <div className="prose max-w-none">
                      <h3 className="text-xl font-semibold mb-4">{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Course Information</h4>
                        <ul className="space-y-2">
                          <li>
                            <span className="font-medium">Category:</span> {course.category}
                          </li>
                          <li>
                            <span className="font-medium">Level:</span> {course.level}
                          </li>
                          <li>
                            <span className="font-medium">Duration:</span> {course.duration}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
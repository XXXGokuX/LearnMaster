import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, Enrollment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function BrowseCourses() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", user?.id],
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", "/api/enrollments", {
        userId: user!.id,
        courseId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments", user?.id] });
      toast({
        title: "Success",
        description: "Successfully enrolled in the course",
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

  const isEnrolled = (courseId: number) => {
    return enrollments?.some((e) => e.courseId === courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="container mx-auto py-8 px-4">
        <motion.h1 
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Browse Courses
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-48 bg-primary/5 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-primary/5 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-primary/5 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))
          ) : (
            courses?.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="p-0 overflow-hidden">
                    <div 
                      className="h-48 bg-cover bg-center rounded-t-lg transform transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <Badge className="mb-2" variant="secondary">
                      {course.category}
                    </Badge>
                    <CardTitle className="mb-2 group-hover:text-primary transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="capitalize">{course.level}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant={isEnrolled(course.id) ? "secondary" : "default"}
                      disabled={isEnrolled(course.id) || enrollMutation.isPending}
                      onClick={() => enrollMutation.mutate(course.id)}
                    >
                      {isEnrolled(course.id) ? "Enrolled" : "Enroll Now"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Course, Enrollment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

export default function MyCourses() {
  const { user } = useAuth();

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", user?.id],
    enabled: !!user,
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const getEnrolledCourse = (courseId: number) => {
    return courses?.find((c) => c.id === courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-24 px-4">
        <motion.h1 
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Courses
        </motion.h1>

        {enrollments?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No courses enrolled yet</h2>
            <p className="text-muted-foreground mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link href="/browse-courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments?.map((enrollment, index) => {
              const course = getEnrolledCourse(enrollment.courseId);
              if (!course) return null;

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="relative p-0">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Link href={`/course/${course.id}`}>
                          <Button variant="ghost" className="text-white">
                            <PlayCircle className="h-12 w-12" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                      <CardTitle className="mb-4">{course.title}</CardTitle>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
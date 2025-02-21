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
import { Loader2, BookOpen, Users, Award, Clock } from "lucide-react";
import { Redirect } from "wouter";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", user?.id],
    enabled: !!user && user.role === "student",
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", "/api/enroll", { courseId });
    },
    onSuccess: () => {
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

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Redirect admin users to admin dashboard
  if (user?.role === "admin") {
    return <Redirect to="/admin/courses" />;
  }

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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-16">
        <motion.div 
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Transform Your Future with Expert-Led Courses
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Access high-quality courses designed to help you master new skills and advance your career.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/browse-courses">
                <Button size="lg" className="mr-4">Browse Courses</Button>
              </Link>
              <Link href="/my-courses">
                <Button variant="outline" size="lg">My Learning</Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <motion.div 
          className="container mx-auto px-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div variants={item} className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold mb-2">{courses?.length || 0}</h3>
              <p className="text-muted-foreground">Total Courses</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold mb-2">1000+</h3>
              <p className="text-muted-foreground">Active Learners</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <Award className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold mb-2">95%</h3>
              <p className="text-muted-foreground">Completion Rate</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-muted-foreground">Learning Access</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-muted-foreground">Start your learning journey with our top courses</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {courses?.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                variants={item}
                className="h-full"
              >
                <Card className="h-full group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-0">
                    <div 
                      className="h-48 bg-cover bg-center rounded-t-lg transform transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {course.category}
                      </span>
                    </div>
                    <CardTitle className="mb-2 group-hover:text-primary transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{course.level}</span>
                      <span>{course.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    {enrolledCourseIds.has(course.id) ? (
                      <Link href={`/course/${course.id}`} className="w-full">
                        <Button className="w-full" variant="secondary">
                          Continue Learning
                        </Button>
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
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/browse-courses">
              <Button variant="outline" size="lg">View All Courses</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground">Real experiences from our community</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Web Developer",
                content: "The courses here transformed my career. The practical approach and expert instruction made all the difference.",
              },
              {
                name: "Michael Chen",
                role: "Data Scientist",
                content: "Comprehensive curriculum and hands-on projects helped me master new skills quickly. Highly recommended!",
              },
              {
                name: "Emily Brown",
                role: "UX Designer",
                content: "The quality of content and the learning experience is exceptional. It's been crucial for my professional growth.",
              },
            ].map((testimonial, index) => (
              <motion.div key={index} variants={item}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
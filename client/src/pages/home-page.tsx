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
import { Loader2, BookOpen, Users, Award, Clock, CheckCircle, Sparkles, Brain, Target, ArrowRight, Laptop, Video, Certificate, BookOpenCheck } from "lucide-react";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
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

      {/* Hero Section with Enhanced Animation */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-32 pb-24">
        <motion.div 
          className="container mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Elevate Your Skills with Expert-Led Learning
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Access world-class courses designed to transform your career and unlock your potential.
              Join thousands of learners already advancing their careers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-x-4"
            >
              <Link href="/browse-courses">
                <Button size="lg" className="px-8">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/my-courses">
                <Button variant="outline" size="lg">View My Courses</Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How Our Platform Works</h2>
            <p className="text-lg text-muted-foreground">
              Follow these simple steps to start your learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10" />,
                title: "Choose Your Course",
                description: "Browse our extensive catalog of expert-led courses across various disciplines."
              },
              {
                icon: <Laptop className="h-10 w-10" />,
                title: "Learn at Your Pace",
                description: "Access course content anytime, anywhere. Learn at your own comfortable pace."
              },
              {
                icon: <Certificate className="h-10 w-10" />,
                title: "Earn Certificates",
                description: "Complete courses and earn certificates to showcase your achievements."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  show: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.2
                    }
                  }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-8">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-lg text-muted-foreground">
              Discover what makes our learning experience unique
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Expert Instructors",
                description: "Learn from industry professionals with real-world experience"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Adaptive Learning",
                description: "Personalized learning paths that adapt to your progress"
              },
              {
                icon: <Video className="h-8 w-8" />,
                title: "HD Video Content",
                description: "High-quality video lectures with practical demonstrations"
              },
              {
                icon: <BookOpenCheck className="h-8 w-8" />,
                title: "Hands-on Projects",
                description: "Real-world projects to apply your knowledge"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1
                    }
                  }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <Card className="h-full hover:bg-primary/5 transition-colors duration-300">
                  <CardContent className="p-6">
                    <div className="text-primary mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-lg text-muted-foreground">
              Start your learning journey with our top-rated courses
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {courses?.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.2
                    }
                  }
                }}
                className="h-full"
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-0">
                    <div 
                      className="h-48 bg-cover bg-center rounded-t-lg transform transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {course.category}
                      </span>
                    </div>
                    <CardTitle className="mb-2 group-hover:text-primary transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {course.level}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </span>
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
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Link href="/browse-courses">
              <Button variant="outline" size="lg">
                Explore All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students who are already transforming their careers
              through our platform. Start learning today!
            </p>
            <Link href="/browse-courses">
              <Button size="lg" className="px-8">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
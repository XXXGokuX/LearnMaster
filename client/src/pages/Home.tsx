import { Navbar } from "@/components/Navbar";
import { Banner } from "@/components/Banner";
import { CourseGrid } from "@/components/CourseGrid";
import { Partners } from "@/components/Partners";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Video, Award, Users, ArrowRight, Sparkles, Brain, Target } from "lucide-react";

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariant = {
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

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariant}
        >
          {/* Banner Section with Animation */}
          <motion.div variants={itemVariant}>
            <Banner />
          </motion.div>

          {/* Features Section */}
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
                <p className="text-lg text-muted-foreground">
                  Experience the best in online learning with our cutting-edge features
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  {
                    icon: <BookOpen className="h-8 w-8" />,
                    title: "Expert-Led Courses",
                    description: "Learn from industry professionals"
                  },
                  {
                    icon: <Video className="h-8 w-8" />,
                    title: "HD Video Content",
                    description: "Crystal clear video lectures"
                  },
                  {
                    icon: <Award className="h-8 w-8" />,
                    title: "Certifications",
                    description: "Earn recognized certificates"
                  },
                  {
                    icon: <Users className="h-8 w-8" />,
                    title: "Community",
                    description: "Join a global learning community"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        transition: { delay: index * 0.2 }
                      }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="mb-4 inline-flex p-3 rounded-full bg-primary/10 text-primary">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Course Grid with Animation */}
          <motion.div 
            variants={itemVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <CourseGrid />
          </motion.div>

          {/* Stats Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { number: "1000+", label: "Active Students", icon: <Users className="h-6 w-6" /> },
                  { number: "100+", label: "Expert Instructors", icon: <Brain className="h-6 w-6" /> },
                  { number: "500+", label: "Course Hours", icon: <Target className="h-6 w-6" /> },
                  { number: "95%", label: "Success Rate", icon: <Sparkles className="h-6 w-6" /> }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
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
                    className="text-center"
                  >
                    <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                      {stat.icon}
                    </div>
                    <h3 className="text-4xl font-bold text-primary mb-2">{stat.number}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Partners Section with Animation */}
          <motion.div 
            variants={itemVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Partners />
          </motion.div>

          {/* Testimonials with Animation */}
          <motion.div 
            variants={itemVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Testimonials />
          </motion.div>

          {/* CTA Section */}
          <section className="py-20 bg-primary/10">
            <motion.div
              className="container mx-auto px-4 text-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

const categories = ["All", "Programming", "Design", "Business", "Marketing", "Other"];

const getCourseImage = (category: string) => {
  const images = {
    "Programming": "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80",
    "Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80",
    "Business": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "Marketing": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80",
    "Other": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop&q=80",
  };
  return images[category as keyof typeof images] || images["Other"];
};

export function CourseGrid() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Explore Our Courses</h2>
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="flex justify-center mb-8">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="px-4">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
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
                courses
                  ?.filter((course) => category === "All" || course.category === category)
                  .map((course) => (
                    <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div 
                          className="h-48 bg-cover bg-center rounded-t-lg"
                          style={{ backgroundImage: `url(${getCourseImage(course.category)})` }}
                        />
                      </CardHeader>
                      <CardContent className="p-6">
                        <Badge className="mb-2" variant="secondary">
                          {course.category}
                        </Badge>
                        <CardTitle className="mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {course.description}
                        </p>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0 flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="capitalize">{course.level}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
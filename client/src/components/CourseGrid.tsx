import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const categories = ["All", "Programming", "Design", "Business", "Marketing", "Other"];

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
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="aspect-video bg-primary/5 rounded-lg mb-4" />
                        <CardTitle>{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <span className="text-sm">{course.duration}</span>
                        <span className="text-sm font-medium capitalize">{course.level}</span>
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

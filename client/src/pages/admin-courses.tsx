import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/ui/dashboard-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, insertCourseSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Digital Marketing",
  "Business",
  "Design",
  "Other"
];

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

export default function AdminCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "beginner",
      duration: "",
      price: 0,
      thumbnail: "",
      poster: "",
      content: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setPosterPreview(null);
      setVideoPreview(null);
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'poster') {
          setPosterPreview(reader.result as string);
        } else {
          setVideoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      form.setValue(type === 'poster' ? 'poster' : 'thumbnail', file);
    }
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'content') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Courses</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" {...form.register("title")} />
                  </div>

                  <div>
                    <Label htmlFor="description">Course Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      onValueChange={value => form.setValue("category", value)}
                      defaultValue={form.watch("category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      onValueChange={value => form.setValue("level", value)}
                      defaultValue={form.watch("level")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (e.g., "4 weeks", "30 hours")</Label>
                    <Input id="duration" {...form.register("duration")} />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (in cents)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="video">Course Video</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                    />
                    {videoPreview && (
                      <div className="mt-2">
                        <video 
                          src={videoPreview} 
                          controls 
                          className="w-full max-h-[200px] object-contain" 
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="poster">Course Poster</Label>
                    <Input
                      id="poster"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'poster')}
                    />
                    {posterPreview && (
                      <div className="mt-2">
                        <img 
                          src={posterPreview} 
                          alt="Course poster preview" 
                          className="w-full max-h-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    Create Course
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm p-6">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-2">{course.description}</p>
              <div className="space-y-2 mb-4">
                <p><span className="font-semibold">Category:</span> {course.category}</p>
                <p><span className="font-semibold">Level:</span> {course.level}</p>
                <p><span className="font-semibold">Duration:</span> {course.duration}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-semibold">${course.price / 100}</p>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(course.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
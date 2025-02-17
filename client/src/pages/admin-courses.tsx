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
import { z } from "zod";
import { Loader2 } from "lucide-react";

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

const createCourseSchema = insertCourseSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  price: z.number().min(0, "Price must be positive"),
});

export default function AdminCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      level: "beginner",
      duration: "",
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Creating course with FormData...");
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setPosterPreview(null);
      setVideoPreview(null);
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Course creation error:', error);
      toast({
        title: "Error creating course",
        description: error.message,
        variant: "destructive",
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
    }
  };

  const onSubmit = async (data: any) => {
    try {
      console.log("Form submitted with data:", data);
      const formData = new FormData();

      // Add basic course data
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('level', data.level);
      formData.append('duration', data.duration);
      formData.append('price', data.price.toString());

      // Add default content
      formData.append('content', JSON.stringify([
        {
          type: "video",
          title: "Introduction",
          description: "Welcome to the course",
        }
      ]));

      // Get file inputs
      const thumbnailInput = document.querySelector<HTMLInputElement>('#video');
      const posterInput = document.querySelector<HTMLInputElement>('#poster');

      // Validate files
      if (!thumbnailInput?.files?.[0] || !posterInput?.files?.[0]) {
        toast({
          title: "Missing files",
          description: "Please upload both a video thumbnail and a poster image",
          variant: "destructive",
        });
        return;
      }

      // Add files
      formData.append('thumbnail', thumbnailInput.files[0]);
      formData.append('poster', posterInput.files[0]);

      // Log formData contents for debugging
      console.log('FormData contents:');
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      createMutation.mutate(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to prepare course data",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Courses</h1>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Create Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 py-4"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input id="title" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (in cents)</Label>
                      <Input
                        id="price"
                        type="number"
                        {...form.register("price", { valueAsNumber: true })}
                      />
                      {form.formState.errors.price && (
                        <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
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
                      {form.formState.errors.category && (
                        <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
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
                      {form.formState.errors.level && (
                        <p className="text-sm text-red-500">{form.formState.errors.level.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (e.g., "4 weeks", "30 hours")</Label>
                    <Input id="duration" {...form.register("duration")} />
                    {form.formState.errors.duration && (
                      <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Course Video</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                    />
                    {videoPreview && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-h-[200px] object-contain bg-black"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poster">Course Poster</Label>
                    <Input
                      id="poster"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'poster')}
                    />
                    {posterPreview && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <img
                          src={posterPreview}
                          alt="Course poster preview"
                          className="w-full max-h-[200px] object-contain bg-gray-100"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      "Create Course"
                    )}
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
import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/ui/dashboard-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course } from "@shared/schema";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { InsertUser, insertUserSchema } from "@shared/schema";


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

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function AdminCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      level: "beginner",
      duration: "",
    },
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Creating course with FormData...");
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setThumbnailPreview(null);
      setVideoFile(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      setVideoFile(file);
    } else if (type === 'thumbnail') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formValues: CourseFormData) => {
    console.log("Form submitted, validation passed with values:", formValues);

    try {
      // Get file inputs directly from the form
      const thumbnailInput = document.getElementById('thumbnail-upload') as HTMLInputElement;
      const videoInput = document.getElementById('video-upload') as HTMLInputElement;

      // Check for required files
      if (!thumbnailInput?.files?.[0] || !videoInput?.files?.[0]) {
        toast({
          title: "Missing files",
          description: "Please upload thumbnail and video files",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      // Add form values
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Add files
      formData.append('thumbnail', thumbnailInput.files[0]);
      formData.append('video', videoInput.files[0]);

      // Add default content with video information
      formData.append('content', JSON.stringify([
        {
          type: "video",
          title: formValues.title,
          description: "Course introduction video",
          url: `/uploads/videos/${videoInput.files[0].name}`,
          duration: "TBD",
        }
      ]));

      console.log('Submitting form with files:', {
        thumbnail: thumbnailInput.files[0],
        video: videoInput.files[0]
      });

      // Submit the form
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
      await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    },
  });

  const userForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student" // Admin can only create student users
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      userForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Create User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" {...userForm.register("username")} />
                      {userForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{userForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" {...userForm.register("password")} />
                      {userForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{userForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : "Create User"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

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
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input id="title" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
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
                          defaultValue={form.getValues("category")}
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
                          defaultValue={form.getValues("level")}
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
                      <Label htmlFor="thumbnail-upload">Course Thumbnail</Label>
                      <Input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                      />
                      {thumbnailPreview && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full max-h-[200px] object-contain bg-black"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-upload">Course Video</Label>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'video')}
                      />
                      {videoFile && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected video: {videoFile.name}
                        </p>
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
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this course?')) {
                      deleteMutation.mutate(course.id);
                    }
                  }}
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
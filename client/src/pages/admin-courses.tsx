import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";


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

const lectureSchema = z.object({
  title: z.string().min(1, "Lecture title is required"),
  description: z.string().min(1, "Lecture description is required"),
  videoFile: z.any().optional(),
});

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  lectures: z.array(lectureSchema).min(1, "At least one lecture is required"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;
type LectureFormData = z.infer<typeof lectureSchema>;

interface LectureFile {
  id: string;
  file: File;
}

export default function AdminCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [lectureFiles, setLectureFiles] = useState<LectureFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      level: "beginner",
      duration: "",
      lectures: [{ title: "", description: "" }],
    },
  });

  const { fields: lectureFields, append, remove } = useFieldArray({
    name: "lectures",
    control: form.control
  });

  const handleLectureVideoChange = (index: number, file: File) => {
    const newLectureFile: LectureFile = {
      id: `lecture-${index}`,
      file,
    };
    setLectureFiles(prev => {
      const filtered = prev.filter(f => f.id !== `lecture-${index}`);
      return [...filtered, newLectureFile];
    });
  };

  const onSubmit = async (formValues: CourseFormData) => {
    try {
      const thumbnailInput = document.getElementById('thumbnail-upload') as HTMLInputElement;
      if (!thumbnailInput?.files?.[0]) {
        toast({
          title: "Missing thumbnail",
          description: "Please upload a course thumbnail",
          variant: "destructive",
        });
        return;
      }

      if (lectureFiles.length !== formValues.lectures.length) {
        toast({
          title: "Missing videos",
          description: "Please upload videos for all lectures",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      // Add basic course data
      formData.append('title', formValues.title);
      formData.append('description', formValues.description);
      formData.append('category', formValues.category);
      formData.append('level', formValues.level);
      formData.append('duration', formValues.duration);

      // Add thumbnail
      formData.append('thumbnail', thumbnailInput.files[0]);

      // Add lecture data and videos
      formValues.lectures.forEach((lecture, index) => {
        formData.append(`lectures[${index}][title]`, lecture.title);
        formData.append(`lectures[${index}][description]`, lecture.description);

        const lectureFile = lectureFiles.find(f => f.id === `lecture-${index}`)?.file;
        if (lectureFile) {
          formData.append(`lecture_${index}`, lectureFile);
        }
      });

      setIsUploading(true);
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/courses', true);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 201) {
          queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
          setThumbnailPreview(null);
          setLectureFiles([]);
          setIsOpen(false);
          form.reset();
          toast({
            title: "Success",
            description: "Course created successfully",
          });
        } else {
          console.error('Upload failed:', xhr.responseText);
          toast({
            title: "Error creating course",
            description: JSON.parse(xhr.responseText)?.message || "Failed to create course",
            variant: "destructive",
          });
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Error creating course",
          description: "Network error occurred while uploading",
          variant: "destructive",
        });
      };

      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
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
      role: "student"
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

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: () => apiRequest("GET", "/api/courses").then(res => res.json())
  })

  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Course Management</h1>
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setThumbnailPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
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

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Lectures</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ title: "", description: "" })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lecture
                        </Button>
                      </div>

                      {lectureFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Lecture {index + 1}</h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Lecture Title</Label>
                            <Input
                              {...form.register(`lectures.${index}.title`)}
                              placeholder="Enter lecture title"
                            />
                            {form.formState.errors.lectures?.[index]?.title && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.lectures[index]?.title?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Lecture Description</Label>
                            <Textarea
                              {...form.register(`lectures.${index}.description`)}
                              placeholder="Enter lecture description"
                            />
                            {form.formState.errors.lectures?.[index]?.description && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.lectures[index]?.description?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Lecture Video</Label>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleLectureVideoChange(index, file);
                                }
                              }}
                            />
                            {lectureFiles.find(f => f.id === `lecture-${index}`) && (
                              <p className="text-sm text-muted-foreground">
                                Video selected: {lectureFiles.find(f => f.id === `lecture-${index}`)?.file.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading course files...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading Course...
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
                <p><span className="font-semibold">Lectures:</span> {course.lectures.length}</p>
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
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Delete Course"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
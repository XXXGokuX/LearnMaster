import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Course, User, Enrollment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";
import { Navbar } from "@/components/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminStudents() {
  const { user } = useAuth();

  const { data: students } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: user?.role === "admin",
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/all-enrollments"],
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  const getStudentEnrollments = (studentId: number) => {
    return enrollments?.filter(e => e.userId === studentId) || [];
  };

  const getCourseTitle = (courseId: number) => {
    return courses?.find(c => c.id === courseId)?.title || "Unknown Course";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-gray-600 mt-2">
            Overview of all students and their course enrollments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Students Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Enrolled Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.filter(s => s.role === "student").map((student) => {
                  const studentEnrollments = getStudentEnrollments(student.id);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.username}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {studentEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="text-sm">
                              {getCourseTitle(enrollment.courseId)}
                            </div>
                          ))}
                          {studentEnrollments.length === 0 && (
                            <span className="text-gray-500">No courses enrolled</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
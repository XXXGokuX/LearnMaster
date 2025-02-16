import { InsertUser, User, Course, InsertCourse, Enrollment, InsertEnrollment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollments(userId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateProgress(userId: number, courseId: number, progress: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<string, Enrollment>;
  public sessionStore: session.Store;
  private currentId: { user: number; course: number; enrollment: number };

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.currentId = { user: 1, course: 1, enrollment: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentId.course++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const existing = await this.getCourse(id);
    if (!existing) throw new Error("Course not found");
    const updated = { ...existing, ...course };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(`${userId}-${courseId}`);
  }

  async getEnrollments(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId,
    );
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentId.enrollment++;
    const newEnrollment: Enrollment = {
      ...enrollment,
      id,
      progress: 0,
      completed: false,
      enrolledAt: new Date(),
    };
    this.enrollments.set(`${enrollment.userId}-${enrollment.courseId}`, newEnrollment);
    return newEnrollment;
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<void> {
    const key = `${userId}-${courseId}`;
    const enrollment = this.enrollments.get(key);
    if (!enrollment) throw new Error("Enrollment not found");
    this.enrollments.set(key, {
      ...enrollment,
      progress,
      completed: progress === 100,
    });
  }
}

export const storage = new MemStorage();

import { users, courses, enrollments, type User, type InsertUser, type Course, type InsertCourse, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollments(userId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateProgress(userId: number, courseId: number, progress: number): Promise<void>;
  getAllEnrollments(): Promise<Enrollment[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    console.log("Creating course with data:", courseData);

    // Ensure content is properly formatted
    const formattedData = {
      ...courseData,
      content: courseData.content || [] as {
        type: "video";
        title: string;
        description?: string;
        url?: string;
      }[]
    };

    console.log("Formatted course data:", formattedData);

    const [course] = await db
      .insert(courses)
      .values(formattedData)
      .returning();

    console.log("Created course:", course);
    return course;
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const [updated] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    // First delete all enrollments for this course
    await db.delete(enrollments).where(eq(enrollments.courseId, id));
    // Then delete the course
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId)
        )
      );
    return enrollment;
  }

  async getEnrollments(userId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        ...enrollment,
        progress: 0,
        completed: false,
      })
      .returning();
    return newEnrollment;
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<void> {
    await db
      .update(enrollments)
      .set({
        progress,
        completed: progress === 100,
      })
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId)
        )
      );
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  }
}

export const storage = new DatabaseStorage();
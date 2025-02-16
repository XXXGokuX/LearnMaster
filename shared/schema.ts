import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Other"),
  level: text("level", { enum: ["beginner", "intermediate", "advanced"] }).notNull().default("beginner"),
  duration: text("duration").notNull().default("TBD"),
  thumbnail: text("thumbnail").notNull(),
  poster: text("poster").notNull().default("default-poster.jpg"),
  price: integer("price").notNull(),
  content: json("content").$type<{
    type: "video" | "document" | "quiz";
    title: string;
    url?: string;
    description?: string;
    duration?: string;
    fileSize?: string;
    questions?: { question: string; options: string[]; answer: number }[];
  }[]>().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  category: true,
  level: true,
  duration: true,
  thumbnail: true,
  poster: true,
  price: true,
  content: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  userId: true,
  courseId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
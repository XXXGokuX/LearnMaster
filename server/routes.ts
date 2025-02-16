import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertEnrollmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from 'express';

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: multerStorage });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Course routes
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(parseInt(req.params.id));
    if (!course) return res.status(404).send("Course not found");
    res.json(course);
  });

  app.post("/api/courses", upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'poster', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const courseData = {
      ...req.body,
      content: JSON.parse(req.body.content),
      thumbnail: files.thumbnail?.[0].path,
      poster: files.poster?.[0].path,
      price: parseInt(req.body.price),
    };

    const parsed = insertCourseSchema.safeParse(courseData);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const course = await storage.createCourse(parsed.data);
    res.status(201).json(course);
  });

  app.patch("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const course = await storage.updateCourse(parseInt(req.params.id), req.body);
    res.json(course);
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    await storage.deleteCourse(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Enrollment routes
  app.post("/api/enroll", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const parsed = insertEnrollmentSchema.safeParse({
      ...req.body,
      userId: req.user.id,
    });
    if (!parsed.success) return res.status(400).json(parsed.error);
    const enrollment = await storage.createEnrollment(parsed.data);
    res.status(201).json(enrollment);
  });

  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const enrollments = await storage.getEnrollments(req.user.id);
    res.json(enrollments);
  });

  app.post("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { courseId, progress } = req.body;
    await storage.updateProgress(req.user.id, courseId, progress);
    res.sendStatus(200);
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
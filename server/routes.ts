import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertEnrollmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';
import { hashPassword } from './auth';

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create specific directories for different file types
    let uploadDir = 'uploads';
    if (file.fieldname === 'video') {
      uploadDir = 'uploads/videos';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for video files
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Add this to the registerRoutes function before the course routes
  app.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: "student" // Force role to be student when created by admin
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: "Failed to create user",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

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
    { name: 'video', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    try {
      console.log('Received request body:', req.body);
      console.log('Received files:', req.files);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.thumbnail?.[0] || !files.video?.[0]) {
        return res.status(400).send("Thumbnail and video files are required");
      }

      const courseData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        level: req.body.level,
        duration: req.body.duration,
        thumbnail: `/uploads/${files.thumbnail[0].filename}`,
        content: JSON.stringify([{
          type: "video",
          title: req.body.title,
          description: "Course introduction video",
          url: `/uploads/videos/${files.video[0].filename}`,
          duration: "TBD",
        }])
      };

      console.log('Processed course data:', courseData);

      const parsed = insertCourseSchema.safeParse(courseData);
      if (!parsed.success) {
        console.error('Validation error:', parsed.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: parsed.error.errors 
        });
      }

      const course = await storage.createCourse(parsed.data);
      console.log('Created course:', course);
      res.status(201).json(course);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ 
        error: "Failed to create course", 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
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

    try {
      // Ensure courseId is provided
      if (!req.body.courseId) {
        return res.status(400).send("Course ID is required");
      }

      // Check if course exists
      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).send("Course not found");
      }

      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollment(req.user.id, req.body.courseId);
      if (existingEnrollment) {
        return res.status(400).send("Already enrolled in this course");
      }

      const parsed = insertEnrollmentSchema.safeParse({
        userId: req.user.id,
        courseId: req.body.courseId,
      });

      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      const enrollment = await storage.createEnrollment(parsed.data);
      console.log(`User ${req.user.id} enrolled in course ${req.body.courseId}`);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error('Enrollment error:', error);
      res.status(500).send("Failed to enroll in course");
    }
  });

  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      // Get enrollments specific to the logged-in user
      const enrollments = await storage.getEnrollments(req.user.id);
      console.log(`Fetched ${enrollments.length} enrollments for user ${req.user.id}`);
      res.json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).send("Failed to fetch enrollments");
    }
  });

  app.post("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const { courseId, progress } = req.body;
    await storage.updateProgress(req.user.id, courseId, progress);
    res.sendStatus(200);
  });

  // Make uploads directory accessible
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.mp4')) {
        res.set('Content-Type', 'video/mp4');
      }
    }
  }));

  // Ensure uploads directories exist
  ['uploads', 'uploads/videos'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Add logging middleware for video requests
  app.use('/uploads', (req, res, next) => {
    console.log('Video request:', req.url);
    console.log('File path:', path.join(process.cwd(), 'uploads', req.url));
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
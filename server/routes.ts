import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';

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

      // Ensure uploads directory exists
      ['uploads', 'uploads/videos'].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      const courseData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        level: req.body.level,
        duration: req.body.duration,
        thumbnail: `/uploads/${files.thumbnail[0].filename}`,
        content: JSON.parse(req.body.content)
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
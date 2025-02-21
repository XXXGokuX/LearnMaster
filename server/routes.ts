import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertEnrollmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = file.fieldname === 'thumbnail' ? 'uploads' : 'uploads/videos';

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
    fileSize: 1024 * 1024 * 1024, // 1GB limit
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'lecture_0', maxCount: 1 },
  { name: 'lecture_1', maxCount: 1 },
  { name: 'lecture_2', maxCount: 1 },
  { name: 'lecture_3', maxCount: 1 },
  { name: 'lecture_4', maxCount: 1 }
]);

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Increase payload limits for the entire application
  app.use(express.json({ limit: '1gb' }));
  app.use(express.urlencoded({ extended: true, limit: '1gb' }));

  // Add CORS headers for file uploads
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Make uploads directory accessible
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Ensure uploads directories exist
  ['uploads', 'uploads/videos'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  app.post("/api/courses", (req, res) => {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({
          error: "File upload error",
          message: err.message,
          details: err
        });
      } else if (err) {
        console.error('Unknown error:', err);
        return res.status(500).json({
          error: "Unknown error",
          message: err.message
        });
      }

      try {
        console.log("Received form data:", req.body);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        console.log("Received files:", files);

        const thumbnailFile = files.thumbnail?.[0];
        if (!thumbnailFile) {
          return res.status(400).json({
            error: "Missing thumbnail",
            message: "Thumbnail file is required"
          });
        }

        // Get lecture files sorted by index
        const lectureFiles = Object.entries(files)
          .filter(([key]) => key.startsWith('lecture_'))
          .sort((a, b) => {
            const aIndex = parseInt(a[0].split('_')[1]);
            const bIndex = parseInt(b[0].split('_')[1]);
            return aIndex - bIndex;
          })
          .map(([, files]) => files[0]);

        console.log("Processed lecture files:", lectureFiles);

        // Process lectures array from form data
        const lectures = [];
        let index = 0;
        while (req.body[`lectures[${index}][title]`] && lectureFiles[index]) {
          lectures.push({
            type: "video" as const,
            title: req.body[`lectures[${index}][title]`],
            description: req.body[`lectures[${index}][description]`] || '',
            url: `/uploads/videos/${lectureFiles[index].filename}`
          });
          index++;
        }

        console.log("Processed lectures:", lectures);

        const courseData = {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          level: req.body.level,
          duration: req.body.duration,
          thumbnail: `/uploads/${thumbnailFile.filename}`,
          content: lectures
        };

        console.log("Final course data:", courseData);

        const parsed = insertCourseSchema.safeParse(courseData);
        if (!parsed.success) {
          console.error("Validation failed:", parsed.error);
          return res.status(400).json({
            error: "Validation failed",
            details: parsed.error.errors
          });
        }

        const course = await storage.createCourse(parsed.data);
        console.log("Course created successfully:", course);
        res.status(201).json(course);
      } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
          error: "Failed to create course",
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  });

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/all-enrollments", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const enrollments = await storage.getAllEnrollments();
    res.json(enrollments);
  });

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

  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(parseInt(req.params.id));
    if (!course) return res.status(404).send("Course not found");
    res.json(course);
  });


  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    await storage.deleteCourse(parseInt(req.params.id));
    res.sendStatus(200);
  });

  app.post("/api/enroll", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
      if (!req.body.courseId) {
        return res.status(400).send("Course ID is required");
      }

      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).send("Course not found");
      }

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

  const httpServer = createServer(app);
  return httpServer;
}

// Dummy hashPassword function - replace with your actual implementation
async function hashPassword(password: string): Promise<string> {
  return password; // Replace with actual hashing logic
}
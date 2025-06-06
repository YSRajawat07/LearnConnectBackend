import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertLectureSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/lectures", async (req, res) => {
    const lectures = await storage.getLectures();
    const filters = req.query;
    
    let filtered = lectures;
    if (filters.topic) filtered = filtered.filter(l => l.topic === filters.topic);
    if (filters.location) filtered = filtered.filter(l => l.location === filters.location);
    if (filters.school) filtered = filtered.filter(l => l.school === filters.school);
    if (filters.branch) filtered = filtered.filter(l => l.branch === filters.branch);
    if (filters.semester) filtered = filtered.filter(l => l.semester === Number(filters.semester));
    if (filters.isLive) filtered = filtered.filter(l => l.isLive === (filters.isLive === 'true'));

    res.json(filtered);
  });

  app.get("/api/lectures/:id", async (req, res) => {
    const lecture = await storage.getLecture(Number(req.params.id));
    if (!lecture) return res.status(404).send("Lecture not found");
    res.json(lecture);
  });

  app.post("/api/lectures", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).send("Only teachers can create lectures");
    }

    const parsed = insertLectureSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const lecture = await storage.createLecture({
      ...parsed.data,
      teacherId: req.user.id,
    });
    res.status(201).json(lecture);
  });

  const httpServer = createServer(app);
  return httpServer;
}

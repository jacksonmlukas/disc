import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateRecommendation, analyzeSentiment } from "./openai";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/reviews", async (req, res) => {
    const reviews = await storage.getReviews();
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const review = await storage.createReview({
      ...req.body,
      userId: req.user.id,
      createdAt: new Date(),
    });
    res.json(review);
  });

  app.get("/api/events/:location", async (req, res) => {
    const events = await storage.getEvents(req.params.location);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const event = await storage.createEvent(req.body);
    res.json(event);
  });

  app.post("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { likedAlbums, reviews } = req.body;
    const recommendations = await generateRecommendation(likedAlbums, reviews);
    res.json(recommendations);
  });

  app.post("/api/analyze-review", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { review } = req.body;
    const sentiment = await analyzeSentiment(review);
    res.json(sentiment);
  });

  const httpServer = createServer(app);
  return httpServer;
}

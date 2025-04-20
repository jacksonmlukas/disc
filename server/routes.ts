import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAdmin } from "./auth";
import { storage } from "./storage";
import { generateRecommendation, analyzeSentiment } from "./openai";
import { insertArtistSchema, insertAlbumSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Admin Routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isAdmin: makeAdmin } = req.body;
      
      if (typeof makeAdmin !== "boolean") {
        return res.status(400).json({ message: "Invalid request. isAdmin field must be a boolean." });
      }
      
      const user = await storage.updateUserAdmin(userId, makeAdmin);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/artists", isAdmin, async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/albums", isAdmin, async (req, res) => {
    try {
      const albums = await storage.getAllAlbums();
      res.json(albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/events", isAdmin, async (req, res) => {
    try {
      // Get all events regardless of location for admin
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Artist routes remain unchanged
  app.get("/api/artists", async (req, res) => {
    const artists = await storage.getAllArtists();
    res.json(artists);
  });

  app.post("/api/artists", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const artistData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(artistData);
      res.status(201).json(artist);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(400).json({ error: "Invalid artist data" });
      }
    }
  });

  // Album routes with enhanced error handling
  app.get("/api/albums", async (req, res) => {
    const { artist_id, search } = req.query;

    try {
      if (typeof search === 'string') {
        const albums = await storage.searchAlbums(search);
        return res.json(albums);
      } else if (typeof artist_id === 'string') {
        const albums = await storage.getAlbumsByArtist(parseInt(artist_id));
        return res.json(albums);
      } else {
        const albums = await storage.getAllAlbums();
        return res.json(albums);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request parameters" });
    }
  });

  app.post("/api/albums", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log("Attempting to parse album data:", req.body);
      const albumData = insertAlbumSchema.parse(req.body);
      console.log("Parsed album data:", albumData);
      const album = await storage.createAlbum(albumData);
      res.status(201).json(album);
    } catch (error) {
      console.error("Album validation error:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Review routes
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

  // Event routes
  app.get("/api/events/:location", async (req, res) => {
    const events = await storage.getEvents(req.params.location);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const event = await storage.createEvent(req.body);
    res.json(event);
  });

  // Recommendation and analysis routes
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
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateRecommendation, analyzeSentiment } from "./openai";
import { insertArtistSchema, insertAlbumSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Artist routes
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
      res.status(400).json({ error: "Invalid artist data" });
    }
  });

  // Album routes
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
      const albumData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum(albumData);
      res.status(201).json(album);
    } catch (error) {
      res.status(400).json({ error: "Invalid album data" });
    }
  });

  // Existing review routes
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

  // Existing event routes
  app.get("/api/events/:location", async (req, res) => {
    const events = await storage.getEvents(req.params.location);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const event = await storage.createEvent(req.body);
    res.json(event);
  });

  // Existing recommendation and analysis routes
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
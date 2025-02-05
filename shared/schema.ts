import { pgTable, text, serial, integer, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  genres: text("genres").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artistId: integer("artist_id").references(() => artists.id),
  releaseDate: timestamp("release_date"),
  coverUrl: text("cover_url"),
  genres: text("genres").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  albumId: integer("album_id").references(() => albums.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  songkickId: text("songkick_id").notNull(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  date: timestamp("date").notNull(),
  artistName: text("artist_name").notNull(),
  location: text("location").notNull(),
  metadata: json("metadata")
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  location: true,
});

export const insertArtistSchema = createInsertSchema(artists);
export const insertAlbumSchema = createInsertSchema(albums);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertEventSchema = createInsertSchema(events);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type User = typeof users.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Event = typeof events.$inferSelect;
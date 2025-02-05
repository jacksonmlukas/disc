import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  albumId: text("album_id").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  location: true,
});

export const insertReviewSchema = createInsertSchema(reviews);
export const insertEventSchema = createInsertSchema(events);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Event = typeof events.$inferSelect;

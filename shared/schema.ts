import { pgTable, text, serial, integer, timestamp, json, jsonb, boolean as pgBoolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const oauthProviders = pgTable("oauth_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // "spotify" or "apple"
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  profileData: jsonb("profile_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Can be null for OAuth users
  location: text("location"),
  profileImage: text("profile_image"),
  email: text("email"),
  isAdmin: pgBoolean("is_admin").default(false),
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

export const insertUserSchema = createInsertSchema(users, {
  password: z.string().optional(),
  email: z.string().email().optional(),
  profileImage: z.string().url().optional(),
});

export const insertOAuthProviderSchema = createInsertSchema(oauthProviders);

export const insertArtistSchema = createInsertSchema(artists);
export const insertAlbumSchema = createInsertSchema(albums, {
  title: z.string().min(1, "Title is required"),
  artistId: z.number().positive("Artist ID must be positive"),
  releaseDate: z.string().transform((str) => new Date(str)),
  coverUrl: z.string().optional(),
  genres: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews);
export const insertEventSchema = createInsertSchema(events);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertOAuthProvider = z.infer<typeof insertOAuthProviderSchema>;

export type User = typeof users.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Event = typeof events.$inferSelect;
export type OAuthProvider = typeof oauthProviders.$inferSelect;
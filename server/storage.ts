import { users, reviews, events, artists, albums, 
  type User, type Review, type Event, type InsertUser,
  type Artist, type Album, type InsertArtist, type InsertAlbum } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Review methods
  getReviews(): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;

  // Event methods
  getEvents(location: string): Promise<Event[]>;
  createEvent(event: Event): Promise<Event>;

  // Music database methods
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByName(name: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  getAllArtists(): Promise<Artist[]>;

  getAlbum(id: number): Promise<Album | undefined>;
  getAlbumsByArtist(artistId: number): Promise<Album[]>;
  createAlbum(album: InsertAlbum): Promise<Album>;
  getAllAlbums(): Promise<Album[]>;
  searchAlbums(query: string): Promise<Album[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Existing methods remain unchanged
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getReviews(): Promise<Review[]> {
    return db.select().from(reviews);
  }

  async createReview(review: Review): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getEvents(location: string): Promise<Event[]> {
    return db.select().from(events).where(eq(events.location, location));
  }

  async createEvent(event: Event): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // New music database methods
  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async getArtistByName(name: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.name, name));
    return artist;
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [newArtist] = await db.insert(artists).values(artist).returning();
    return newArtist;
  }

  async getAllArtists(): Promise<Artist[]> {
    return db.select().from(artists);
  }

  async getAlbum(id: number): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album;
  }

  async getAlbumsByArtist(artistId: number): Promise<Album[]> {
    return db.select().from(albums).where(eq(albums.artistId, artistId));
  }

  async createAlbum(album: InsertAlbum): Promise<Album> {
    const [newAlbum] = await db.insert(albums).values(album).returning();
    return newAlbum;
  }

  async getAllAlbums(): Promise<Album[]> {
    return db.select().from(albums);
  }

  async searchAlbums(query: string): Promise<Album[]> {
    return db.select()
      .from(albums)
      .where(sql`${albums.title} ILIKE ${`%${query}%`}`);
  }
}

export const storage = new DatabaseStorage();
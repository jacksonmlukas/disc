import { users, reviews, events, artists, albums, oauthProviders,
  type User, type Review, type Event, type InsertUser,
  type Artist, type Album, type InsertArtist, type InsertAlbum,
  type OAuthProvider, type InsertOAuthProvider } from "@shared/schema";
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
  getAllUsers(): Promise<User[]>;
  updateUserAdmin(userId: number, isAdmin: boolean): Promise<User | undefined>;

  // OAuth methods
  getUserByOAuthProvider(provider: string, providerId: string): Promise<User | undefined>;
  createOAuthProvider(oauthProvider: InsertOAuthProvider): Promise<OAuthProvider>;
  getOAuthProviderByUserId(userId: number, provider: string): Promise<OAuthProvider | undefined>;
  updateOAuthProviderTokens(id: number, accessToken: string, refreshToken: string | null, expiresAt: Date): Promise<OAuthProvider>;
  
  // Review methods
  getReviews(): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;

  // Event methods
  getEvents(location: string): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
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
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async updateUserAdmin(userId: number, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // OAuth methods
  async getUserByOAuthProvider(provider: string, providerId: string): Promise<User | undefined> {
    const [result] = await db
      .select({ user: users })
      .from(oauthProviders)
      .innerJoin(users, eq(oauthProviders.userId, users.id))
      .where(
        sql`${oauthProviders.provider} = ${provider} AND ${oauthProviders.providerId} = ${providerId}`
      );
    
    return result?.user;
  }

  async createOAuthProvider(oauthProvider: InsertOAuthProvider): Promise<OAuthProvider> {
    const [newProvider] = await db.insert(oauthProviders).values(oauthProvider).returning();
    return newProvider;
  }

  async getOAuthProviderByUserId(userId: number, provider: string): Promise<OAuthProvider | undefined> {
    const [oauthProvider] = await db
      .select()
      .from(oauthProviders)
      .where(
        sql`${oauthProviders.userId} = ${userId} AND ${oauthProviders.provider} = ${provider}`
      );
    
    return oauthProvider;
  }

  async updateOAuthProviderTokens(
    id: number, 
    accessToken: string, 
    refreshToken: string | null, 
    expiresAt: Date
  ): Promise<OAuthProvider> {
    const [updatedProvider] = await db
      .update(oauthProviders)
      .set({
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(oauthProviders.id, id))
      .returning();
    
    return updatedProvider;
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
  
  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
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
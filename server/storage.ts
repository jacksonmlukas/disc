import { InsertUser, User, Review, Event, insertUserSchema } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getReviews(): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;
  getEvents(location: string): Promise<Event[]>;
  createEvent(event: Event): Promise<Event>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private events: Map<number, Event>;
  public sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.events = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async createReview(review: Review): Promise<Review> {
    const id = this.currentId++;
    this.reviews.set(id, { ...review, id });
    return review;
  }

  async getEvents(location: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.location === location
    );
  }

  async createEvent(event: Event): Promise<Event> {
    const id = this.currentId++;
    this.events.set(id, { ...event, id });
    return event;
  }
}

export const storage = new MemStorage();

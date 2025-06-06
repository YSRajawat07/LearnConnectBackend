import { InsertUser, User, InsertLecture, Lecture } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLectures(): Promise<Lecture[]>;
  getLecture(id: number): Promise<Lecture | undefined>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  updateLecture(id: number, lecture: Partial<InsertLecture>): Promise<Lecture>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lectures: Map<number, Lecture>;
  private currentUserId: number;
  private currentLectureId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.lectures = new Map();
    this.currentUserId = 1;
    this.currentLectureId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLectures(): Promise<Lecture[]> {
    return Array.from(this.lectures.values());
  }

  async getLecture(id: number): Promise<Lecture | undefined> {
    return this.lectures.get(id);
  }

  async createLecture(lecture: InsertLecture): Promise<Lecture> {
    const id = this.currentLectureId++;
    const newLecture: Lecture = { ...lecture, id };
    this.lectures.set(id, newLecture);
    return newLecture;
  }

  async updateLecture(id: number, lecture: Partial<InsertLecture>): Promise<Lecture> {
    const existing = await this.getLecture(id);
    if (!existing) throw new Error("Lecture not found");
    const updated = { ...existing, ...lecture };
    this.lectures.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

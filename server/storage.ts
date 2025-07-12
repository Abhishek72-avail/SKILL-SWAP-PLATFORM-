import {
  users,
  skills,
  swapRequests,
  reviews,
  platformMessages,
  type User,
  type UpsertUser,
  type Skill,
  type InsertSkill,
  type SwapRequest,
  type InsertSwapRequest,
  type Review,
  type InsertReview,
  type PlatformMessage,
  type InsertPlatformMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, ilike } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Skill operations
  getUserSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  searchSkills(query: string, type?: string, category?: string): Promise<(Skill & { user: User })[]>;

  // User browsing
  getPublicUsers(limit?: number, offset?: number): Promise<(User & { skills: Skill[] })[]>;
  searchUsers(query: string): Promise<(User & { skills: Skill[] })[]>;

  // Swap request operations
  createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequestsForUser(userId: string, type: "sent" | "received"): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  })[]>;
  updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest>;
  getSwapRequestById(id: number): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  }) | undefined>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getUserReviews(userId: string): Promise<(Review & { reviewer: User })[]>;

  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  banUser(userId: string): Promise<void>;
  getAllSwapRequests(): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  })[]>;
  createPlatformMessage(message: InsertPlatformMessage): Promise<PlatformMessage>;
  getActivePlatformMessages(): Promise<PlatformMessage[]>;

  // Statistics
  getUserStats(userId: string): Promise<{
    activeSwaps: number;
    skillsOffered: number;
    pendingRequests: number;
    rating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Skill operations
  async getUserSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  async searchSkills(query: string, type?: string, category?: string): Promise<(Skill & { user: User })[]> {
    let conditions = [ilike(skills.name, `%${query}%`)];
    
    if (type) {
      conditions.push(eq(skills.type, type));
    }
    
    if (category) {
      conditions.push(eq(skills.category, category));
    }

    return await db
      .select()
      .from(skills)
      .innerJoin(users, eq(skills.userId, users.id))
      .where(and(...conditions))
      .limit(20);
  }

  // User browsing
  async getPublicUsers(limit = 20, offset = 0): Promise<(User & { skills: Skill[] })[]> {
    const publicUsers = await db
      .select()
      .from(users)
      .where(eq(users.isPublic, true))
      .limit(limit)
      .offset(offset);

    const usersWithSkills = await Promise.all(
      publicUsers.map(async (user) => {
        const userSkills = await this.getUserSkills(user.id);
        return { ...user, skills: userSkills };
      })
    );

    return usersWithSkills;
  }

  async searchUsers(query: string): Promise<(User & { skills: Skill[] })[]> {
    const foundUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isPublic, true),
          or(
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`),
            ilike(users.location, `%${query}%`)
          )
        )
      )
      .limit(20);

    const usersWithSkills = await Promise.all(
      foundUsers.map(async (user) => {
        const userSkills = await this.getUserSkills(user.id);
        return { ...user, skills: userSkills };
      })
    );

    return usersWithSkills;
  }

  // Swap request operations
  async createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest> {
    const [newRequest] = await db.insert(swapRequests).values(request).returning();
    return newRequest;
  }

  async getSwapRequestsForUser(userId: string, type: "sent" | "received"): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  })[]> {
    const condition = type === "sent" 
      ? eq(swapRequests.requesterId, userId)
      : eq(swapRequests.targetId, userId);

    return await db
      .select()
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .innerJoin(users, eq(swapRequests.targetId, users.id))
      .innerJoin(skills, eq(swapRequests.offeredSkillId, skills.id))
      .innerJoin(skills, eq(swapRequests.wantedSkillId, skills.id))
      .where(condition)
      .orderBy(desc(swapRequests.createdAt));
  }

  async updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest> {
    const [updated] = await db
      .update(swapRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(swapRequests.id, id))
      .returning();
    return updated;
  }

  async getSwapRequestById(id: number): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  }) | undefined> {
    const [request] = await db
      .select()
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .innerJoin(users, eq(swapRequests.targetId, users.id))
      .innerJoin(skills, eq(swapRequests.offeredSkillId, skills.id))
      .innerJoin(skills, eq(swapRequests.wantedSkillId, skills.id))
      .where(eq(swapRequests.id, id));
    
    return request;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update user rating
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, review.revieweeId));
    
    const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    
    await db
      .update(users)
      .set({ 
        rating: avgRating, 
        reviewCount: userReviews.length,
        updatedAt: new Date()
      })
      .where(eq(users.id, review.revieweeId));
    
    return newReview;
  }

  async getUserReviews(userId: string): Promise<(Review & { reviewer: User })[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  // Admin operations
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async banUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isPublic: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllSwapRequests(): Promise<(SwapRequest & {
    requester: User;
    target: User;
    offeredSkill: Skill;
    wantedSkill: Skill;
  })[]> {
    return await db
      .select()
      .from(swapRequests)
      .innerJoin(users, eq(swapRequests.requesterId, users.id))
      .innerJoin(users, eq(swapRequests.targetId, users.id))
      .innerJoin(skills, eq(swapRequests.offeredSkillId, skills.id))
      .innerJoin(skills, eq(swapRequests.wantedSkillId, skills.id))
      .orderBy(desc(swapRequests.createdAt));
  }

  async createPlatformMessage(message: InsertPlatformMessage): Promise<PlatformMessage> {
    const [newMessage] = await db.insert(platformMessages).values(message).returning();
    return newMessage;
  }

  async getActivePlatformMessages(): Promise<PlatformMessage[]> {
    return await db
      .select()
      .from(platformMessages)
      .where(eq(platformMessages.isActive, true))
      .orderBy(desc(platformMessages.createdAt));
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    activeSwaps: number;
    skillsOffered: number;
    pendingRequests: number;
    rating: number;
  }> {
    const user = await this.getUser(userId);
    const userSkills = await this.getUserSkills(userId);
    const sentRequests = await this.getSwapRequestsForUser(userId, "sent");
    const receivedRequests = await this.getSwapRequestsForUser(userId, "received");

    const activeSwaps = sentRequests.filter(r => r.status === "accepted").length +
                       receivedRequests.filter(r => r.status === "accepted").length;
    
    const skillsOffered = userSkills.filter(s => s.type === "offered").length;
    const pendingRequests = receivedRequests.filter(r => r.status === "pending").length;

    return {
      activeSwaps,
      skillsOffered,
      pendingRequests,
      rating: user?.rating || 0,
    };
  }
}

export const storage = new DatabaseStorage();

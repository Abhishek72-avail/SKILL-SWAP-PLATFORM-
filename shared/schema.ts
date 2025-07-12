import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  availability: text("availability"),
  isPublic: boolean("is_public").default(true),
  isAdmin: boolean("is_admin").default(false),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"),
  level: varchar("level"), // "beginner", "intermediate", "expert"
  type: varchar("type").notNull(), // "offered" or "wanted"
  priority: varchar("priority"), // "high", "medium", "low" for wanted skills
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  targetId: varchar("target_id").notNull().references(() => users.id),
  offeredSkillId: integer("offered_skill_id").notNull().references(() => skills.id),
  wantedSkillId: integer("wanted_skill_id").notNull().references(() => skills.id),
  message: text("message"),
  preferredSchedule: varchar("preferred_schedule"),
  status: varchar("status").notNull().default("pending"), // "pending", "accepted", "rejected", "completed", "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  swapRequestId: integer("swap_request_id").notNull().references(() => swapRequests.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformMessages = pgTable("platform_messages", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // "update", "maintenance", "announcement"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  sentRequests: many(swapRequests, { relationName: "requester" }),
  receivedRequests: many(swapRequests, { relationName: "target" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewee" }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
  offeredInRequests: many(swapRequests, { relationName: "offeredSkill" }),
  wantedInRequests: many(swapRequests, { relationName: "wantedSkill" }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one, many }) => ({
  requester: one(users, {
    fields: [swapRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  target: one(users, {
    fields: [swapRequests.targetId],
    references: [users.id],
    relationName: "target",
  }),
  offeredSkill: one(skills, {
    fields: [swapRequests.offeredSkillId],
    references: [skills.id],
    relationName: "offeredSkill",
  }),
  wantedSkill: one(skills, {
    fields: [swapRequests.wantedSkillId],
    references: [skills.id],
    relationName: "wantedSkill",
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  swapRequest: one(swapRequests, {
    fields: [reviews.swapRequestId],
    references: [swapRequests.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformMessageSchema = createInsertSchema(platformMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type PlatformMessage = typeof platformMessages.$inferSelect;
export type InsertPlatformMessage = z.infer<typeof insertPlatformMessageSchema>;

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSkillSchema, 
  insertSwapRequestSchema, 
  insertReviewSchema,
  insertPlatformMessageSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only return public profile data for non-authenticated requests
      if (!req.isAuthenticated() && !user.isPublic) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const skills = await storage.getUserSkills(user.id);
      res.json({ ...user, skills });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skillData = insertSkillSchema.parse({
        ...req.body,
        userId,
      });
      
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const updateData = req.body;
      
      const skill = await storage.updateSkill(skillId, updateData);
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      await storage.deleteSkill(skillId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  app.get('/api/skills/search', async (req, res) => {
    try {
      const { q, type, category } = req.query;
      const results = await storage.searchSkills(
        q as string || '',
        type as string,
        category as string
      );
      res.json(results);
    } catch (error) {
      console.error("Error searching skills:", error);
      res.status(500).json({ message: "Failed to search skills" });
    }
  });

  // Browse users routes
  app.get('/api/users', async (req, res) => {
    try {
      const { limit = 20, offset = 0, search } = req.query;
      
      let users;
      if (search) {
        users = await storage.searchUsers(search as string);
      } else {
        users = await storage.getPublicUsers(
          parseInt(limit as string),
          parseInt(offset as string)
        );
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Swap request routes
  app.get('/api/swap-requests/sent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getSwapRequestsForUser(userId, "sent");
      res.json(requests);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      res.status(500).json({ message: "Failed to fetch sent requests" });
    }
  });

  app.get('/api/swap-requests/received', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getSwapRequestsForUser(userId, "received");
      res.json(requests);
    } catch (error) {
      console.error("Error fetching received requests:", error);
      res.status(500).json({ message: "Failed to fetch received requests" });
    }
  });

  app.post('/api/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertSwapRequestSchema.parse({
        ...req.body,
        requesterId: userId,
      });
      
      const request = await storage.createSwapRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating swap request:", error);
      res.status(500).json({ message: "Failed to create swap request" });
    }
  });

  app.put('/api/swap-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["accepted", "rejected", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateSwapRequestStatus(requestId, status);
      res.json(request);
    } catch (error) {
      console.error("Error updating request status:", error);
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/:userId', async (req, res) => {
    try {
      const reviews = await storage.getUserReviews(req.params.userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Statistics routes
  app.get('/api/stats/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { limit = 50, offset = 0 } = req.query;
      const users = await storage.getAllUsers(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/ban', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.banUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.get('/api/admin/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const requests = await storage.getAllSwapRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching all swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.post('/api/admin/messages', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messageData = insertPlatformMessageSchema.parse(req.body);
      const message = await storage.createPlatformMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating platform message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/platform-messages', async (req, res) => {
    try {
      const messages = await storage.getActivePlatformMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching platform messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

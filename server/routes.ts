import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongoStorage";
import { setupCustomAuth, isAuthenticated } from "./customAuth";
import { setupVideoCall, videoCallManager } from "./videoCall";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupCustomAuth(app);

  // Note: Auth routes are now handled in customAuth.ts

  // User profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await mongoStorage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only return public profile data for non-authenticated requests
      if (!req.isAuthenticated() && !user.isPublic) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const skills = await mongoStorage.getUserSkills(user._id);
      res.json({ ...user, skills });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      const updatedUser = await mongoStorage.updateUser(userId, updateData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const skills = await mongoStorage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const skillData = {
        ...req.body,
        userId,
      };
      
      const skill = await mongoStorage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = req.params.id;
      const skillData = req.body;
      
      const skill = await mongoStorage.updateSkill(skillId, skillData);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = req.params.id;
      await mongoStorage.deleteSkill(skillId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  app.get('/api/skills/search', async (req, res) => {
    try {
      const { q: query, type, category } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const skills = await mongoStorage.searchSkills(
        query,
        type as string,
        category as string
      );
      
      res.json(skills);
    } catch (error) {
      console.error("Error searching skills:", error);
      res.status(500).json({ message: "Failed to search skills" });
    }
  });

  // User browsing routes
  app.get('/api/users', async (req, res) => {
    try {
      const { limit = '20', offset = '0', q: query } = req.query;
      
      if (query && typeof query === 'string') {
        const users = await mongoStorage.searchUsers(query);
        res.json(users);
      } else {
        const users = await mongoStorage.getPublicUsers(
          parseInt(limit as string, 10),
          parseInt(offset as string, 10)
        );
        res.json(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Swap request routes
  app.post('/api/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user._id;
      const requestData = {
        ...req.body,
        requesterId,
      };
      
      const swapRequest = await mongoStorage.createSwapRequest(requestData);
      res.status(201).json(swapRequest);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(500).json({ message: "Failed to create swap request" });
    }
  });

  app.get('/api/swap-requests/sent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const requests = await mongoStorage.getSwapRequestsForUser(userId, "sent");
      res.json(requests);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      res.status(500).json({ message: "Failed to fetch sent requests" });
    }
  });

  app.get('/api/swap-requests/received', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const requests = await mongoStorage.getSwapRequestsForUser(userId, "received");
      res.json(requests);
    } catch (error) {
      console.error("Error fetching received requests:", error);
      res.status(500).json({ message: "Failed to fetch received requests" });
    }
  });

  app.put('/api/swap-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const requestId = req.params.id;
      const { status } = req.body;
      
      const updatedRequest = await mongoStorage.updateSwapRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating swap request status:", error);
      res.status(500).json({ message: "Failed to update swap request status" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user._id;
      const reviewData = {
        ...req.body,
        reviewerId,
      };
      
      const review = await mongoStorage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/users/:id/reviews', async (req, res) => {
    try {
      const userId = req.params.id;
      const reviews = await mongoStorage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Dashboard stats
  app.get('/api/stats/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const stats = await mongoStorage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { limit = '50', offset = '0' } = req.query;
      const users = await mongoStorage.getAllUsers(
        parseInt(limit as string, 10),
        parseInt(offset as string, 10)
      );
      res.json(users);
    } catch (error) {
      console.error("Error fetching users for admin:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:id/ban', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = req.params.id;
      await mongoStorage.banUser(userId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.get('/api/admin/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const requests = await mongoStorage.getAllSwapRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching swap requests for admin:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  // Video call initiation endpoint
  app.post('/api/calls/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId, swapRequestId } = req.body;
      const initiatorId = req.user._id;

      if (!targetUserId) {
        return res.status(400).json({ message: 'Target user ID is required' });
      }

      const result = await videoCallManager.initiateCallForSwapRequest(
        swapRequestId,
        initiatorId,
        targetUserId
      );

      if (result.success) {
        res.json({ roomId: result.roomId, message: 'Call initiated successfully' });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      res.status(500).json({ message: 'Failed to initiate call' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup video calling with WebSocket support
  setupVideoCall(httpServer);
  
  return httpServer;
}
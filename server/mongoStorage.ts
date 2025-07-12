import { User, IUser } from "./models/User";
import { Skill, ISkill } from "./models/Skill";
import { SwapRequest, ISwapRequest } from "./models/SwapRequest";
import { Review, IReview } from "./models/Review";

export interface IMongoStorage {
  // User operations
  getUser(id: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;

  // Skill operations
  getUserSkills(userId: string): Promise<ISkill[]>;
  createSkill(skill: Partial<ISkill>): Promise<ISkill>;
  updateSkill(id: string, skill: Partial<ISkill>): Promise<ISkill | null>;
  deleteSkill(id: string): Promise<void>;
  searchSkills(query: string, type?: string, category?: string): Promise<(ISkill & { user: IUser })[]>;

  // User browsing
  getPublicUsers(limit?: number, offset?: number): Promise<(IUser & { skills: ISkill[] })[]>;
  searchUsers(query: string): Promise<(IUser & { skills: ISkill[] })[]>;

  // Swap request operations
  createSwapRequest(request: Partial<ISwapRequest>): Promise<ISwapRequest>;
  getSwapRequestsForUser(userId: string, type: "sent" | "received"): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  })[]>;
  updateSwapRequestStatus(id: string, status: string): Promise<ISwapRequest | null>;
  getSwapRequestById(id: string): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  }) | null>;

  // Review operations
  createReview(review: Partial<IReview>): Promise<IReview>;
  getUserReviews(userId: string): Promise<(IReview & { reviewer: IUser })[]>;

  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<IUser[]>;
  banUser(userId: string): Promise<void>;
  getAllSwapRequests(): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  })[]>;

  // Statistics
  getUserStats(userId: string): Promise<{
    activeSwaps: number;
    skillsOffered: number;
    pendingRequests: number;
    rating: number;
  }>;
}

export class MongoStorage implements IMongoStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  // Skill operations
  async getUserSkills(userId: string): Promise<ISkill[]> {
    return await Skill.find({ userId }).sort({ createdAt: -1 });
  }

  async createSkill(skill: Partial<ISkill>): Promise<ISkill> {
    const newSkill = new Skill(skill);
    return await newSkill.save();
  }

  async updateSkill(id: string, skill: Partial<ISkill>): Promise<ISkill | null> {
    return await Skill.findByIdAndUpdate(id, skill, { new: true });
  }

  async deleteSkill(id: string): Promise<void> {
    await Skill.findByIdAndDelete(id);
  }

  async searchSkills(query: string, type?: string, category?: string): Promise<(ISkill & { user: IUser })[]> {
    const filter: any = {
      name: { $regex: query, $options: 'i' }
    };
    
    if (type) filter.type = type;
    if (category) filter.category = category;

    const skills = await Skill.find(filter).populate('userId').limit(20);
    return skills.map(skill => ({
      ...skill.toObject(),
      user: skill.userId as unknown as IUser
    }));
  }

  // User browsing
  async getPublicUsers(limit = 20, offset = 0): Promise<(IUser & { skills: ISkill[] })[]> {
    const users = await User.find({ isPublic: true })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const usersWithSkills = await Promise.all(
      users.map(async (user) => {
        const skills = await this.getUserSkills(user._id);
        return { ...user.toObject(), skills };
      })
    );

    return usersWithSkills;
  }

  async searchUsers(query: string): Promise<(IUser & { skills: ISkill[] })[]> {
    const users = await User.find({
      isPublic: true,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    const usersWithSkills = await Promise.all(
      users.map(async (user) => {
        const skills = await this.getUserSkills(user._id);
        return { ...user.toObject(), skills };
      })
    );

    return usersWithSkills;
  }

  // Swap request operations
  async createSwapRequest(request: Partial<ISwapRequest>): Promise<ISwapRequest> {
    const swapRequest = new SwapRequest(request);
    return await swapRequest.save();
  }

  async getSwapRequestsForUser(userId: string, type: "sent" | "received"): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  })[]> {
    const filter = type === "sent" 
      ? { requesterId: userId }
      : { targetId: userId };

    const requests = await SwapRequest.find(filter)
      .populate('requesterId')
      .populate('targetId')
      .populate('offeredSkillId')
      .populate('wantedSkillId')
      .sort({ createdAt: -1 });

    return requests.map(request => ({
      ...request.toObject(),
      requester: request.requesterId as unknown as IUser,
      target: request.targetId as unknown as IUser,
      offeredSkill: request.offeredSkillId as unknown as ISkill,
      wantedSkill: request.wantedSkillId as unknown as ISkill
    }));
  }

  async updateSwapRequestStatus(id: string, status: string): Promise<ISwapRequest | null> {
    return await SwapRequest.findByIdAndUpdate(
      id, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
  }

  async getSwapRequestById(id: string): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  }) | null> {
    const request = await SwapRequest.findById(id)
      .populate('requesterId')
      .populate('targetId')
      .populate('offeredSkillId')
      .populate('wantedSkillId');

    if (!request) return null;

    return {
      ...request.toObject(),
      requester: request.requesterId as unknown as IUser,
      target: request.targetId as unknown as IUser,
      offeredSkill: request.offeredSkillId as unknown as ISkill,
      wantedSkill: request.wantedSkillId as unknown as ISkill
    };
  }

  // Review operations
  async createReview(review: Partial<IReview>): Promise<IReview> {
    const newReview = new Review(review);
    await newReview.save();
    
    // Update user rating
    const reviews = await Review.find({ revieweeId: review.revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await User.findByIdAndUpdate(review.revieweeId, {
      rating: avgRating,
      reviewCount: reviews.length,
      updatedAt: new Date()
    });
    
    return newReview;
  }

  async getUserReviews(userId: string): Promise<(IReview & { reviewer: IUser })[]> {
    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId')
      .sort({ createdAt: -1 });

    return reviews.map(review => ({
      ...review.toObject(),
      reviewer: review.reviewerId as unknown as IUser
    }));
  }

  // Admin operations
  async getAllUsers(limit = 50, offset = 0): Promise<IUser[]> {
    return await User.find()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async banUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { 
      isPublic: false, 
      updatedAt: new Date() 
    });
  }

  async getAllSwapRequests(): Promise<(ISwapRequest & {
    requester: IUser;
    target: IUser;
    offeredSkill: ISkill;
    wantedSkill: ISkill;
  })[]> {
    const requests = await SwapRequest.find()
      .populate('requesterId')
      .populate('targetId')
      .populate('offeredSkillId')
      .populate('wantedSkillId')
      .sort({ createdAt: -1 });

    return requests.map(request => ({
      ...request.toObject(),
      requester: request.requesterId as unknown as IUser,
      target: request.targetId as unknown as IUser,
      offeredSkill: request.offeredSkillId as unknown as ISkill,
      wantedSkill: request.wantedSkillId as unknown as ISkill
    }));
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    activeSwaps: number;
    skillsOffered: number;
    pendingRequests: number;
    rating: number;
  }> {
    const user = await this.getUser(userId);
    const skills = await this.getUserSkills(userId);
    const sentRequests = await this.getSwapRequestsForUser(userId, "sent");
    
    const activeSwaps = sentRequests.filter(req => req.status === 'accepted').length;
    const skillsOffered = skills.filter(skill => skill.type === 'offered').length;
    const pendingRequests = sentRequests.filter(req => req.status === 'pending').length;
    
    return {
      activeSwaps,
      skillsOffered,
      pendingRequests,
      rating: user?.rating || 0
    };
  }
}

export const mongoStorage = new MongoStorage();
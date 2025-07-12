import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Handshake, 
  Bolt, 
  Clock, 
  Star, 
  Search,
  UserCog,
  Plus,
  ChevronRight,
  Code,
  Palette,
  Camera,
  BarChart3,
  Video,
  Languages
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/dashboard"],
    retry: false,
  });

  const { data: mySkills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/skills/my"],
    retry: false,
  });

  const { data: sentRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/swap-requests/sent"],
    retry: false,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-odoo-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-odoo-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  const skillsOffered = mySkills?.filter((skill: any) => skill.type === "offered") || [];
  const skillsWanted = mySkills?.filter((skill: any) => skill.type === "wanted") || [];
  const recentRequests = sentRequests?.slice(0, 3) || [];

  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase();
    if (name.includes('web') || name.includes('programming') || name.includes('code')) return Code;
    if (name.includes('design') || name.includes('graphic')) return Palette;
    if (name.includes('photo')) return Camera;
    if (name.includes('data') || name.includes('analysis')) return BarChart3;
    if (name.includes('video')) return Video;
    if (name.includes('language')) return Languages;
    return Bolt;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "expert": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "beginner": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-odoo-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-odoo-dark">Dashboard</h2>
              <p className="text-sm text-gray-600">Manage your skills and discover new opportunities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search skills or users..." 
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-odoo-purple focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Swaps</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {statsLoading ? "..." : stats?.activeSwaps || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Handshake className="text-green-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+2.5%</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skills Offered</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {statsLoading ? "..." : stats?.skillsOffered || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Bolt className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-600 font-medium">+1</span>
                  <span className="text-gray-500 ml-1">new skill added</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {statsLoading ? "..." : stats?.pendingRequests || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-yellow-600 font-medium">3</span>
                  <span className="text-gray-500 ml-1">require action</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {statsLoading ? "..." : (stats?.rating?.toFixed(1) || "0.0")}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Star className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-purple-600 font-medium">★★★★★</span>
                  <span className="text-gray-500 ml-1">24 reviews</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Swap Requests */}
            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-odoo-dark">Recent Swap Requests</CardTitle>
                  <Link href="/requests" className="text-odoo-purple hover:text-purple-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {requestsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No recent requests</div>
                ) : (
                  <div className="space-y-4">
                    {recentRequests.map((request: any) => (
                      <div key={request.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.target?.profileImageUrl} />
                          <AvatarFallback>
                            {request.target?.firstName?.[0]}{request.target?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-odoo-dark">
                              {request.target?.firstName} {request.target?.lastName}
                            </h4>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Wants: {request.wantedSkill?.name} → Offers: {request.offeredSkill?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-odoo-dark">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <Button asChild className="w-full bg-odoo-purple hover:bg-purple-700 h-auto p-4">
                    <Link href="/profile">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <UserCog className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">Update Profile</p>
                            <p className="text-sm text-purple-100">Add new skills or update availability</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </Button>

                  <Button asChild className="w-full bg-odoo-teal hover:bg-teal-700 h-auto p-4">
                    <Link href="/browse">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <Search className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">Find Skills</p>
                            <p className="text-sm text-teal-100">Browse available skills in your area</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full h-auto p-4">
                    <Link href="/requests">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <Plus className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">Create Request</p>
                            <p className="text-sm text-gray-500">Send a new swap request</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Overview */}
          <Card className="border border-gray-100 mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-odoo-dark">Your Skills</CardTitle>
                <Button asChild className="bg-odoo-purple text-white hover:bg-purple-700">
                  <Link href="/profile">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skill
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skills Offered */}
                <div>
                  <h4 className="font-medium text-odoo-dark mb-4 flex items-center">
                    <Bolt className="mr-2 text-green-600 h-4 w-4" />
                    Skills I Offer
                  </h4>
                  {skillsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : skillsOffered.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No skills offered yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/profile">Add Your First Skill</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skillsOffered.map((skill: any) => {
                        const IconComponent = getSkillIcon(skill.name);
                        return (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="text-green-600 h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-odoo-dark">{skill.name}</p>
                                <p className="text-sm text-gray-600">{skill.description || skill.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getLevelColor(skill.level)}>
                                {skill.level || "intermediate"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Skills Wanted */}
                <div>
                  <h4 className="font-medium text-odoo-dark mb-4 flex items-center">
                    <Search className="mr-2 text-blue-600 h-4 w-4" />
                    Skills I Want to Learn
                  </h4>
                  {skillsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : skillsWanted.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No skills wanted yet</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/profile">Add Skills You Want</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skillsWanted.map((skill: any) => {
                        const IconComponent = getSkillIcon(skill.name);
                        return (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="text-blue-600 h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-odoo-dark">{skill.name}</p>
                                <p className="text-sm text-gray-600">{skill.description || skill.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(skill.priority)}>
                                {skill.priority || "medium"} priority
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

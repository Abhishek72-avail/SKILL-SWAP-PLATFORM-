import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Handshake,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from "lucide-react";

export default function AdminAnalytics() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: swapRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/admin/swap-requests"],
    retry: false,
    enabled: !!user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
    enabled: !!user?.isAdmin,
  });

  if (authLoading || !user?.isAdmin) {
    return <div className="min-h-screen bg-odoo-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-odoo-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  // Calculate analytics
  const totalRequests = swapRequests?.length || 0;
  const pendingRequests = swapRequests?.filter((r: any) => r.status === "pending").length || 0;
  const acceptedRequests = swapRequests?.filter((r: any) => r.status === "accepted").length || 0;
  const completedRequests = swapRequests?.filter((r: any) => r.status === "completed").length || 0;
  const rejectedRequests = swapRequests?.filter((r: any) => r.status === "rejected").length || 0;

  const activeUsers = users?.filter((u: any) => u.isPublic).length || 0;
  const totalUsers = users?.length || 0;

  const recentRequests = swapRequests?.slice(0, 10) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return Clock;
      case "accepted": return CheckCircle;
      case "rejected": return XCircle;
      case "completed": return Star;
      case "cancelled": return XCircle;
      default: return Clock;
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalUsers,
      activeUsers,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
      rejectedRequests,
      recentRequests: recentRequests.slice(0, 5),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillswap-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Analytics report downloaded successfully",
    });
  };

  return (
    <div className="flex h-screen bg-odoo-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-odoo-dark">Analytics & Reports</h2>
              <p className="text-sm text-gray-600">Monitor platform activity and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleDownloadReport} className="bg-odoo-purple hover:bg-purple-700">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-odoo-dark">{totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {activeUsers} active
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({Math.round((activeUsers / totalUsers) * 100) || 0}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-3xl font-bold text-odoo-dark">{totalRequests}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Handshake className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {completedRequests} completed
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({Math.round((completedRequests / totalRequests) * 100) || 0}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-odoo-dark">{pendingRequests}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-yellow-600 font-medium">
                    Require attention
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {Math.round(((acceptedRequests + completedRequests) / totalRequests) * 100) || 0}%
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {acceptedRequests + completedRequests} successful
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-odoo-dark flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Request Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="mr-3 h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{pendingRequests}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {Math.round((pendingRequests / totalRequests) * 100) || 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
                      <span className="font-medium">Accepted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{acceptedRequests}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {Math.round((acceptedRequests / totalRequests) * 100) || 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Star className="mr-3 h-5 w-5 text-blue-600" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{completedRequests}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {Math.round((completedRequests / totalRequests) * 100) || 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="mr-3 h-5 w-5 text-red-600" />
                      <span className="font-medium">Rejected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{rejectedRequests}</span>
                      <Badge className="bg-red-100 text-red-800">
                        {Math.round((rejectedRequests / totalRequests) * 100) || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-odoo-dark">
                  Platform Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">User Engagement</span>
                      <span>{Math.round((activeUsers / totalUsers) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.round((activeUsers / totalUsers) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Request Success Rate</span>
                      <span>{Math.round(((acceptedRequests + completedRequests) / totalRequests) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.round(((acceptedRequests + completedRequests) / totalRequests) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Completion Rate</span>
                      <span>{Math.round((completedRequests / (acceptedRequests + completedRequests)) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${Math.round((completedRequests / (acceptedRequests + completedRequests)) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Swap Requests */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-odoo-dark flex items-center">
                <Handshake className="mr-2 h-5 w-5" />
                Recent Swap Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {requestsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-odoo-purple mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading requests...</p>
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600">Swap requests will appear here once users start exchanging skills</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requester</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Skill Exchange</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRequests.map((request: any) => {
                        const StatusIcon = getStatusIcon(request.status);
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={request.requester?.profileImageUrl} />
                                  <AvatarFallback className="text-xs">
                                    {request.requester?.firstName?.[0]}{request.requester?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {request.requester?.firstName} {request.requester?.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={request.target?.profileImageUrl} />
                                  <AvatarFallback className="text-xs">
                                    {request.target?.firstName?.[0]}{request.target?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {request.target?.firstName} {request.target?.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-green-700 font-medium">
                                  Offers: {request.offeredSkill?.name}
                                </div>
                                <div className="text-blue-700">
                                  Wants: {request.wantedSkill?.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(request.status)}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="mr-2 h-4 w-4" />
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

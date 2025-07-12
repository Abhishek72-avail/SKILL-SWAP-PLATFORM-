import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle,
  Calendar,
  Mail,
  MapPin
} from "lucide-react";

export default function AdminUsers() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
    enabled: !!user?.isAdmin,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been banned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((u: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.location?.toLowerCase().includes(query)
    );
  }) || [];

  if (authLoading || !user?.isAdmin) {
    return <div className="min-h-screen bg-odoo-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-odoo-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-odoo-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-odoo-dark">User Management</h2>
              <p className="text-sm text-gray-600">Manage platform users and their access</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {users?.length || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Public Profiles</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {users?.filter((u: any) => u.isPublic).length || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Private Profiles</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {users?.filter((u: any) => !u.isPublic).length || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <XCircle className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-3xl font-bold text-odoo-dark">
                      {users?.filter((u: any) => u.isAdmin).length || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Ban className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-odoo-dark flex items-center">
                <Users className="mr-2 h-5 w-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-odoo-purple mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? "Try adjusting your search criteria" : "No users are registered yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={u.profileImageUrl} />
                                <AvatarFallback>
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-odoo-dark">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-sm text-gray-500">ID: {u.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-gray-400" />
                              {u.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.location ? (
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                {u.location}
                              </div>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isPublic ? "default" : "secondary"}>
                              {u.isPublic ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isAdmin ? "destructive" : "outline"}>
                              {u.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {u.rating ? (
                                <>
                                  <span className="font-medium">{u.rating.toFixed(1)}</span>
                                  <span className="text-gray-400 ml-1">
                                    ({u.reviewCount} reviews)
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400">No rating</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="mr-2 h-4 w-4" />
                              {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {!u.isAdmin && u.isPublic && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to ban ${u.firstName} ${u.lastName}?`)) {
                                      banUserMutation.mutate(u.id);
                                    }
                                  }}
                                  disabled={banUserMutation.isPending}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Ban
                                </Button>
                              )}
                              {!u.isPublic && (
                                <Badge variant="secondary" className="text-xs">
                                  Banned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Handshake, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Star,
  Calendar
} from "lucide-react";

export default function SwapRequests() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("received");

  const { data: sentRequests, isLoading: sentLoading } = useQuery({
    queryKey: ["/api/swap-requests/sent"],
    retry: false,
  });

  const { data: receivedRequests, isLoading: receivedLoading } = useQuery({
    queryKey: ["/api/swap-requests/received"],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/swap-requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/sent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/received"] });
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
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });

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

  const RequestCard = ({ request, type }: { request: any; type: "sent" | "received" }) => {
    const otherUser = type === "sent" ? request.target : request.requester;
    const StatusIcon = getStatusIcon(request.status);

    return (
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser?.profileImageUrl} />
              <AvatarFallback>
                {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-odoo-dark">
                  {otherUser?.firstName} {otherUser?.lastName}
                </h3>
                <Badge className={getStatusColor(request.status)}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {request.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium text-green-700">Offering:</span> {request.offeredSkill?.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Wants:</span> {request.wantedSkill?.name}
                </div>
                {request.preferredSchedule && (
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {request.preferredSchedule}
                  </div>
                )}
                {request.message && (
                  <div className="text-sm text-gray-600 flex items-start">
                    <MessageSquare className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="italic">"{request.message}"</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()} at {" "}
                  {new Date(request.createdAt).toLocaleTimeString()}
                </span>
                
                <div className="flex space-x-2">
                  {type === "received" && request.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: request.id, status: "accepted" })}
                        disabled={updateStatusMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: request.id, status: "rejected" })}
                        disabled={updateStatusMutation.isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {type === "sent" && request.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: request.id, status: "cancelled" })}
                      disabled={updateStatusMutation.isPending}
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  )}

                  {request.status === "accepted" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: request.id, status: "completed" })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-odoo-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-odoo-dark">Swap Requests</h2>
              <p className="text-sm text-gray-600">Manage your skill exchange requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Handshake className="h-4 w-4" />
                <span>Total: {(sentRequests?.length || 0) + (receivedRequests?.length || 0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="received" className="flex items-center space-x-2">
                <span>Received Requests</span>
                {receivedRequests?.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {receivedRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center space-x-2">
                <span>Sent Requests</span>
                {sentRequests?.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              {receivedLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-odoo-purple mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading received requests...</p>
                </div>
              ) : receivedRequests?.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No received requests</h3>
                    <p className="text-gray-600">
                      When others send you skill swap requests, they'll appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {receivedRequests?.map((request: any) => (
                    <RequestCard key={request.id} request={request} type="received" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {sentLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-odoo-purple mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading sent requests...</p>
                </div>
              ) : sentRequests?.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent requests</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't sent any skill swap requests yet. Browse skills to get started!
                    </p>
                    <Button className="bg-odoo-purple hover:bg-purple-700">
                      Browse Skills
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sentRequests?.map((request: any) => (
                    <RequestCard key={request.id} request={request} type="sent" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import CallButton from "@/components/call-button";

interface SwapRequestCardProps {
  request: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    requester: {
      id: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
    target: {
      id: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
    offeredSkill: {
      id: number;
      name: string;
    };
    wantedSkill: {
      id: number;
      name: string;
    };
    message?: string;
    createdAt: string;
  };
  type: 'sent' | 'received';
  currentUserId: string;
  onUpdateStatus?: (id: string, status: string) => void;
}

export default function SwapRequestCard({ 
  request, 
  type, 
  currentUserId, 
  onUpdateStatus 
}: SwapRequestCardProps) {
  const otherUser = type === 'sent' ? request.target : request.requester;
  const isCurrentUserRequester = currentUserId === request.requester.id;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.profileImageUrl} />
              <AvatarFallback>
                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {otherUser.firstName} {otherUser.lastName}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {type === 'sent' ? 'Swap request sent' : 'Swap request received'}
              </p>
            </div>
          </div>
          
          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
            {getStatusIcon(request.status)}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {isCurrentUserRequester ? 'You offer:' : 'They offer:'}
            </p>
            <Badge className="bg-green-100 text-green-800">
              {request.offeredSkill.name}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {isCurrentUserRequester ? 'You want:' : 'They want:'}
            </p>
            <Badge className="bg-blue-100 text-blue-800">
              {request.wantedSkill.name}
            </Badge>
          </div>
        </div>

        {request.message && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Message:</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {request.message}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {new Date(request.createdAt).toLocaleDateString()}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {type === 'received' && request.status === 'pending' && onUpdateStatus && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(request.id, 'accepted')}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(request.id, 'rejected')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Decline
              </Button>
            </>
          )}
          
          {request.status === 'accepted' && (
            <div className="flex gap-2 w-full">
              <CallButton
                targetUserId={otherUser.id}
                targetUserName={`${otherUser.firstName} ${otherUser.lastName}`}
                swapRequestId={request.id}
                size="sm"
                className="flex-1"
              />
              
              {onUpdateStatus && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(request.id, 'completed')}
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                >
                  Mark Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
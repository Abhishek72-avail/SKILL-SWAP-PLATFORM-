import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CallInvitationProps {
  callerName: string;
  callerAvatar?: string;
  roomId: string;
  swapRequestId?: string;
  onAccept: (roomId: string) => void;
  onDecline: () => void;
  onTimeout: () => void;
  timeoutDuration?: number; // in seconds, default 30
}

export default function CallInvitation({
  callerName,
  callerAvatar,
  roomId,
  swapRequestId,
  onAccept,
  onDecline,
  onTimeout,
  timeoutDuration = 30
}: CallInvitationProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const handleAccept = () => {
    toast({
      title: "Joining Call",
      description: "Connecting to video call...",
    });
    onAccept(roomId);
  };

  const handleDecline = () => {
    toast({
      title: "Call Declined",
      description: "You declined the video call",
    });
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-2xl animate-pulse">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20 border-4 border-blue-200">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                {callerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl text-gray-800">
            Incoming Video Call
          </CardTitle>
          <p className="text-gray-600 font-medium">{callerName}</p>
          {swapRequestId && (
            <p className="text-sm text-blue-600 mt-2">
              Skill sharing session
            </p>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Video size={16} />
            <span className="text-sm">Video call invitation</span>
          </div>
          
          <div className="text-sm text-gray-500">
            Call expires in {timeLeft} seconds
          </div>
          
          <div className="flex justify-center gap-6 pt-4">
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDecline}
              className="h-14 w-14 rounded-full hover:scale-110 transition-transform"
            >
              <PhoneOff size={24} />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={handleAccept}
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 hover:scale-110 transition-transform"
            >
              <Phone size={24} />
            </Button>
          </div>
          
          <div className="text-xs text-gray-400 pt-2">
            Room ID: {roomId}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
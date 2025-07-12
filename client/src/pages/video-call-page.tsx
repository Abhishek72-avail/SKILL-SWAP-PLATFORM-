import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import VideoCall from '@/components/video-call';
import CallInvitation from '@/components/call-invitation';
import { useAuth } from '@/hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

export default function VideoCallPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    roomId: string;
    fromUserId: string;
    callerName: string;
    swapRequestId?: string;
  } | null>(null);

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const roomIdFromUrl = urlParams.get('roomId');
  const swapRequestIdFromUrl = urlParams.get('swapRequestId');

  useEffect(() => {
    if (!user) {
      setLocation('/signin');
      return;
    }

    // If there's a room ID in URL, join that room
    if (roomIdFromUrl) {
      setCurrentRoomId(roomIdFromUrl);
      setIsInCall(true);
      return;
    }

    // Otherwise, set up socket to listen for incoming calls
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join-service', {
        userId: user.id,
        userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username
      });
    });

    socket.on('incoming-call', (data: {
      roomId: string;
      swapRequestId?: string;
      fromUserId: string;
      callType: string;
    }) => {
      // Get caller info (in real app, you'd fetch this from API)
      setIncomingCall({
        roomId: data.roomId,
        fromUserId: data.fromUserId,
        callerName: 'Fellow Professional', // This should be fetched from user data
        swapRequestId: data.swapRequestId
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, roomIdFromUrl]);

  const handleAcceptCall = (roomId: string) => {
    setIncomingCall(null);
    setCurrentRoomId(roomId);
    setIsInCall(true);
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    toast({
      title: "Call Declined",
      description: "You declined the incoming call",
    });
  };

  const handleCallTimeout = () => {
    setIncomingCall(null);
    toast({
      title: "Call Missed",
      description: "The incoming call has expired",
      variant: "destructive",
    });
  };

  const handleCallEnd = () => {
    setIsInCall(false);
    setCurrentRoomId(null);
    setLocation('/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-900">
      {incomingCall && (
        <CallInvitation
          callerName={incomingCall.callerName}
          roomId={incomingCall.roomId}
          swapRequestId={incomingCall.swapRequestId}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onTimeout={handleCallTimeout}
        />
      )}
      
      {isInCall && currentRoomId && (
        <VideoCall
          roomId={currentRoomId}
          swapRequestId={swapRequestIdFromUrl || undefined}
          onCallEnd={handleCallEnd}
          userInfo={{
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username
          }}
        />
      )}
      
      {!isInCall && !incomingCall && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Video Call Service</h1>
            <p className="text-gray-300 mb-4">Waiting for incoming calls...</p>
            <button
              onClick={() => setLocation('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
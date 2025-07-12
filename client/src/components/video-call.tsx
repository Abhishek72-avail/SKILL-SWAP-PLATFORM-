import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface VideoCallProps {
  roomId?: string;
  swapRequestId?: string;
  onCallEnd: () => void;
  userInfo: {
    id: string;
    name: string;
  };
}

interface Participant {
  socketId: string;
  userId: string;
  userName: string;
  isInCall: boolean;
}

interface CallRoom {
  id: string;
  participants: Participant[];
  createdAt: string;
  swapRequestId?: string;
}

export default function VideoCall({ roomId, swapRequestId, onCallEnd, userInfo }: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<CallRoom | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'calling' | 'ended'>('connecting');
  const [isInCall, setIsInCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const { toast } = useToast();

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Initialize socket connection
      const socket = io('/', {
        transports: ['websocket', 'polling']
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join-service', {
          userId: userInfo.id,
          userName: userInfo.name
        });

        if (roomId) {
          // Join existing room
          socket.emit('join-room', { roomId });
        } else {
          // Create new room
          socket.emit('create-room', { swapRequestId });
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setCallStatus('ended');
      });

      // Room events
      socket.on('room-created', (data: { roomId: string; room: CallRoom }) => {
        setCurrentRoom(data.room);
        setCallStatus('calling');
        toast({
          title: "Room Created",
          description: `Waiting for others to join. Room ID: ${data.roomId}`,
        });
      });

      socket.on('room-joined', (data: { room: CallRoom }) => {
        setCurrentRoom(data.room);
        setCallStatus('connected');
        startCall();
      });

      socket.on('user-joined', (data: { participant: Participant; room: CallRoom }) => {
        setCurrentRoom(data.room);
        setCallStatus('connected');
        toast({
          title: "User Joined",
          description: `${data.participant.userName} joined the call`,
        });
        startCall();
      });

      socket.on('user-left', (data: { userId: string; userName: string }) => {
        toast({
          title: "User Left",
          description: `${data.userName} left the call`,
        });
        handleRemoteUserLeft();
      });

      // WebRTC signaling events
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);

      // Call control events
      socket.on('peer-audio-toggle', (data: { userId: string; isEnabled: boolean }) => {
        // Handle remote user audio toggle
      });

      socket.on('peer-video-toggle', (data: { userId: string; isEnabled: boolean }) => {
        // Handle remote user video toggle
      });

      socket.on('call-ended', () => {
        setCallStatus('ended');
        onCallEnd();
      });

      socket.on('call-error', (data: { message: string }) => {
        toast({
          title: "Call Error",
          description: data.message,
          variant: "destructive",
        });
      });

      // Get user media
      await getUserMedia();

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: "Call Error",
        description: "Failed to initialize video call",
        variant: "destructive",
      });
    }
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Error",
        description: "Could not access camera/microphone",
        variant: "destructive",
      });
    }
  };

  const startCall = async () => {
    if (!localStreamRef.current || !socketRef.current) return;

    try {
      // Create peer connection
      const peerConnection = new RTCPeerConnection(rtcConfiguration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsInCall(true);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current && currentRoom) {
          socketRef.current.emit('ice-candidate', {
            roomId: currentRoom.id,
            candidate: event.candidate,
            targetUserId: getRemoteUserId()
          });
        }
      };

      // Create and send offer if we're the first user
      if (currentRoom && currentRoom.participants.length === 1) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socketRef.current.emit('offer', {
          roomId: currentRoom.id,
          offer: offer,
          targetUserId: getRemoteUserId()
        });
      }

    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleOffer = async (data: { offer: RTCSessionDescriptionInit; fromUserId: string; fromUserName: string }) => {
    if (!peerConnectionRef.current || !socketRef.current || !currentRoom) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        roomId: currentRoom.id,
        answer: answer,
        targetUserId: data.fromUserId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; fromUserId: string; fromUserName: string }) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; fromUserId: string; fromUserName: string }) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (socketRef.current && currentRoom) {
          socketRef.current.emit('toggle-audio', {
            roomId: currentRoom.id,
            isEnabled: audioTrack.enabled
          });
        }
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (socketRef.current && currentRoom) {
          socketRef.current.emit('toggle-video', {
            roomId: currentRoom.id,
            isEnabled: videoTrack.enabled
          });
        }
      }
    }
  };

  const endCall = () => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('end-call', { roomId: currentRoom.id });
    }
    cleanup();
    onCallEnd();
  };

  const handleRemoteUserLeft = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
    setIsInCall(false);
  };

  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setCallStatus('ended');
  };

  const getRemoteUserId = (): string => {
    if (!currentRoom) return '';
    const remoteParticipant = currentRoom.participants.find(p => p.userId !== userInfo.id);
    return remoteParticipant?.userId || '';
  };

  const getRemoteUserName = (): string => {
    if (!currentRoom) return '';
    const remoteParticipant = currentRoom.participants.find(p => p.userId !== userInfo.id);
    return remoteParticipant?.userName || 'Remote User';
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold">Video Call</h2>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
            {currentRoom && (
              <div className="flex items-center gap-2 text-gray-300">
                <Users size={16} />
                <span>{currentRoom.participants.length}/2</span>
              </div>
            )}
          </div>
          <div className="text-gray-300 text-sm">
            {callStatus === 'calling' && 'Waiting for participant...'}
            {callStatus === 'connected' && `Connected with ${getRemoteUserName()}`}
            {callStatus === 'connecting' && 'Connecting...'}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-gray-800"
        />
        
        {/* Local Video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Call Status Overlay */}
        {!isInCall && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-6 text-center">
                <div className="text-white text-lg mb-2">
                  {callStatus === 'calling' && 'Waiting for participant to join...'}
                  {callStatus === 'connecting' && 'Connecting to call...'}
                  {callStatus === 'connected' && 'Establishing connection...'}
                </div>
                {currentRoom && (
                  <div className="text-gray-300 text-sm">
                    Room ID: {currentRoom.id}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="icon"
            onClick={toggleAudio}
            className="h-12 w-12 rounded-full"
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="icon"
            onClick={toggleVideo}
            className="h-12 w-12 rounded-full"
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={endCall}
            className="h-12 w-12 rounded-full"
          >
            <PhoneOff size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
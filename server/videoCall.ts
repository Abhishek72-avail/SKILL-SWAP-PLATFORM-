import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { mongoStorage } from './mongoStorage';

interface CallUser {
  socketId: string;
  userId: string;
  userName: string;
  isInCall: boolean;
}

interface CallRoom {
  id: string;
  participants: CallUser[];
  createdAt: Date;
  swapRequestId?: string;
}

class VideoCallManager {
  private io: SocketIOServer;
  private rooms: Map<string, CallRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected to video call service:', socket.id);

      // User joins the video call service
      socket.on('join-service', async (data: { userId: string; userName: string }) => {
        try {
          this.userSockets.set(data.userId, socket.id);
          socket.userId = data.userId;
          socket.userName = data.userName;
          console.log(`User ${data.userName} (${data.userId}) joined video service`);
        } catch (error) {
          console.error('Error joining video service:', error);
        }
      });

      // Create a new call room
      socket.on('create-room', async (data: { swapRequestId?: string }) => {
        try {
          const roomId = this.generateRoomId();
          const room: CallRoom = {
            id: roomId,
            participants: [{
              socketId: socket.id,
              userId: socket.userId,
              userName: socket.userName,
              isInCall: true
            }],
            createdAt: new Date(),
            swapRequestId: data.swapRequestId
          };

          this.rooms.set(roomId, room);
          socket.join(roomId);
          
          socket.emit('room-created', { roomId, room });
          console.log(`Room ${roomId} created by ${socket.userName}`);
        } catch (error) {
          console.error('Error creating room:', error);
          socket.emit('call-error', { message: 'Failed to create room' });
        }
      });

      // Join an existing room
      socket.on('join-room', async (data: { roomId: string }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            socket.emit('call-error', { message: 'Room not found' });
            return;
          }

          if (room.participants.length >= 2) {
            socket.emit('call-error', { message: 'Room is full' });
            return;
          }

          const participant: CallUser = {
            socketId: socket.id,
            userId: socket.userId,
            userName: socket.userName,
            isInCall: true
          };

          room.participants.push(participant);
          socket.join(data.roomId);

          // Notify existing participants
          socket.to(data.roomId).emit('user-joined', { 
            participant,
            room 
          });

          socket.emit('room-joined', { room });
          console.log(`${socket.userName} joined room ${data.roomId}`);
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('call-error', { message: 'Failed to join room' });
        }
      });

      // WebRTC signaling
      socket.on('offer', (data: { roomId: string; offer: any; targetUserId: string }) => {
        socket.to(data.roomId).emit('offer', {
          offer: data.offer,
          fromUserId: socket.userId,
          fromUserName: socket.userName
        });
      });

      socket.on('answer', (data: { roomId: string; answer: any; targetUserId: string }) => {
        socket.to(data.roomId).emit('answer', {
          answer: data.answer,
          fromUserId: socket.userId,
          fromUserName: socket.userName
        });
      });

      socket.on('ice-candidate', (data: { roomId: string; candidate: any; targetUserId: string }) => {
        socket.to(data.roomId).emit('ice-candidate', {
          candidate: data.candidate,
          fromUserId: socket.userId,
          fromUserName: socket.userName
        });
      });

      // Call controls
      socket.on('toggle-audio', (data: { roomId: string; isEnabled: boolean }) => {
        socket.to(data.roomId).emit('peer-audio-toggle', {
          userId: socket.userId,
          isEnabled: data.isEnabled
        });
      });

      socket.on('toggle-video', (data: { roomId: string; isEnabled: boolean }) => {
        socket.to(data.roomId).emit('peer-video-toggle', {
          userId: socket.userId,
          isEnabled: data.isEnabled
        });
      });

      socket.on('end-call', (data: { roomId: string }) => {
        this.handleUserLeaveRoom(socket, data.roomId);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected from video service:', socket.id);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          this.handleUserDisconnect(socket);
        }
      });
    });
  }

  private handleUserLeaveRoom(socket: any, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove user from room
    room.participants = room.participants.filter(p => p.socketId !== socket.id);
    socket.leave(roomId);

    // Notify other participants
    socket.to(roomId).emit('user-left', {
      userId: socket.userId,
      userName: socket.userName
    });

    // If room is empty, delete it
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted - no participants`);
    }

    socket.emit('call-ended');
  }

  private handleUserDisconnect(socket: any) {
    // Find and clean up any rooms the user was in
    for (const [roomId, room] of this.rooms.entries()) {
      const participantIndex = room.participants.findIndex(p => p.socketId === socket.id);
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
        
        // Notify other participants
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName
        });

        // If room is empty, delete it
        if (room.participants.length === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // API method to initiate call for swap request
  public async initiateCallForSwapRequest(swapRequestId: string, initiatorId: string, targetId: string) {
    const roomId = this.generateRoomId();
    
    // Check if both users are online
    const initiatorSocketId = this.userSockets.get(initiatorId);
    const targetSocketId = this.userSockets.get(targetId);

    if (initiatorSocketId && targetSocketId) {
      // Send call invitation to target user
      this.io.to(targetSocketId).emit('incoming-call', {
        roomId,
        swapRequestId,
        fromUserId: initiatorId,
        callType: 'skill-session'
      });

      return { success: true, roomId };
    }

    return { success: false, message: 'One or both users are offline' };
  }
}

let videoCallManager: VideoCallManager;

export function setupVideoCall(server: HTTPServer) {
  videoCallManager = new VideoCallManager(server);
  return videoCallManager;
}

export { videoCallManager };
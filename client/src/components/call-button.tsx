import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface CallButtonProps {
  targetUserId: string;
  targetUserName: string;
  swapRequestId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function CallButton({
  targetUserId,
  targetUserName,
  swapRequestId,
  variant = 'default',
  size = 'default',
  className = ''
}: CallButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const initiateCallMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/calls/initiate', {
        targetUserId,
        swapRequestId
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Call Initiated",
        description: `Calling ${targetUserName}...`,
      });
      
      // Navigate to call page with room ID
      setLocation(`/call?roomId=${data.roomId}${swapRequestId ? `&swapRequestId=${swapRequestId}` : ''}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Call Failed",
        description: error.message || "Could not initiate video call",
        variant: "destructive",
      });
    },
  });

  const handleStartCall = () => {
    initiateCallMutation.mutate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartCall}
      disabled={initiateCallMutation.isPending}
      className={className}
    >
      {initiateCallMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Video className="h-4 w-4 mr-2" />
      )}
      {initiateCallMutation.isPending ? 'Calling...' : 'Start Video Call'}
    </Button>
  );
}
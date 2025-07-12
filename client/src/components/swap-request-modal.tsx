import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface SwapRequestModalProps {
  targetUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    skills: Array<{
      id: number;
      name: string;
      type: string;
    }>;
  };
  onClose: () => void;
}

export default function SwapRequestModal({ targetUser, onClose }: SwapRequestModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    offeredSkillId: "",
    wantedSkillId: "",
    message: "",
    preferredSchedule: "",
  });

  const { data: mySkills } = useQuery({
    queryKey: ["/api/skills/my"],
    retry: false,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/swap-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Swap request sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/sent"] });
      onClose();
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
        description: "Failed to send swap request",
        variant: "destructive",
      });
    },
  });

  const myOfferedSkills = mySkills?.filter((skill: any) => skill.type === "offered") || [];
  const targetOfferedSkills = targetUser.skills?.filter(skill => skill.type === "offered") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.offeredSkillId || !formData.wantedSkillId) {
      toast({
        title: "Error",
        description: "Please select both skills to offer and want",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      targetId: targetUser.id,
      offeredSkillId: parseInt(formData.offeredSkillId),
      wantedSkillId: parseInt(formData.wantedSkillId),
      message: formData.message,
      preferredSchedule: formData.preferredSchedule,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Send Swap Request
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={targetUser.profileImageUrl} />
            <AvatarFallback>
              {targetUser.firstName?.[0]}{targetUser.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-odoo-dark">
              {targetUser.firstName} {targetUser.lastName}
            </h4>
            <p className="text-sm text-gray-600">
              {targetOfferedSkills.length} skills available
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="offeredSkill">Skills You're Offering</Label>
            <Select
              value={formData.offeredSkillId}
              onValueChange={(value) => setFormData({ ...formData, offeredSkillId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer..." />
              </SelectTrigger>
              <SelectContent>
                {myOfferedSkills.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No skills offered yet. Add skills to your profile first.
                  </div>
                ) : (
                  myOfferedSkills.map((skill: any) => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="wantedSkill">Skills You Want to Learn</Label>
            <Select
              value={formData.wantedSkillId}
              onValueChange={(value) => setFormData({ ...formData, wantedSkillId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a skill they offer..." />
              </SelectTrigger>
              <SelectContent>
                {targetOfferedSkills.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    This user has no skills offered.
                  </div>
                ) : (
                  targetOfferedSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="schedule">Preferred Schedule</Label>
            <Select
              value={formData.preferredSchedule}
              onValueChange={(value) => setFormData({ ...formData, preferredSchedule: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your availability..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="mornings">Mornings</SelectItem>
                <SelectItem value="afternoons">Afternoons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRequestMutation.isPending || myOfferedSkills.length === 0 || targetOfferedSkills.length === 0}
              className="flex-1 bg-odoo-purple hover:bg-purple-700"
            >
              {createRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

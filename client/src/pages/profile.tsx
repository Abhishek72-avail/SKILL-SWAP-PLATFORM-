import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import SkillForm from "@/components/skill-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2,
  Save,
  X
} from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    bio: "",
    availability: "",
    isPublic: true,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/skills/my"],
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        location: profile.location || "",
        bio: profile.bio || "",
        availability: profile.availability || "",
        isPublic: profile.isPublic ?? true,
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/my"] });
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
        description: "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleDeleteSkill = (skillId: number) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      deleteSkillMutation.mutate(skillId);
    }
  };

  const skillsOffered = skills?.filter((skill: any) => skill.type === "offered") || [];
  const skillsWanted = skills?.filter((skill: any) => skill.type === "wanted") || [];

  if (authLoading || profileLoading) {
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
              <h2 className="text-2xl font-bold text-odoo-dark">My Profile</h2>
              <p className="text-sm text-gray-600">Manage your profile and skills</p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="bg-odoo-purple hover:bg-purple-700">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Profile Card */}
          <Card className="border border-gray-100 mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-odoo-dark flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.profileImageUrl} />
                  <AvatarFallback className="text-lg">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 font-medium text-odoo-dark">{formData.firstName || "Not set"}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 font-medium text-odoo-dark">{formData.lastName || "Not set"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600 flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {formData.location || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell others about yourself and your expertise..."
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">{formData.bio || "No bio set"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    {isEditing ? (
                      <Input
                        id="availability"
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="e.g., Weekends, Evenings, Flexible"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formData.availability || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isPublic">Public Profile</Label>
                    {isEditing ? (
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                      />
                    ) : (
                      <Badge variant={formData.isPublic ? "default" : "secondary"}>
                        {formData.isPublic ? "Public" : "Private"}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {formData.isPublic ? "Others can find and contact you" : "Your profile is hidden from search"}
                    </span>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="bg-odoo-purple hover:bg-purple-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-odoo-dark">My Skills</CardTitle>
                <Button 
                  onClick={() => setShowSkillForm(true)}
                  className="bg-odoo-purple hover:bg-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skills Offered */}
                <div>
                  <h4 className="font-medium text-odoo-dark mb-4">Skills I Offer</h4>
                  {skillsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : skillsOffered.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No skills offered yet</p>
                      <Button onClick={() => setShowSkillForm(true)} variant="outline" size="sm">
                        Add Your First Skill
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skillsOffered.map((skill: any) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div>
                            <p className="font-medium text-odoo-dark">{skill.name}</p>
                            <p className="text-sm text-gray-600">{skill.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {skill.category}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                {skill.level}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSkill(skill);
                                setShowSkillForm(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSkill(skill.id)}
                              disabled={deleteSkillMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Wanted */}
                <div>
                  <h4 className="font-medium text-odoo-dark mb-4">Skills I Want to Learn</h4>
                  {skillsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : skillsWanted.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No skills wanted yet</p>
                      <Button onClick={() => setShowSkillForm(true)} variant="outline" size="sm">
                        Add Skills You Want
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skillsWanted.map((skill: any) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <p className="font-medium text-odoo-dark">{skill.name}</p>
                            <p className="text-sm text-gray-600">{skill.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {skill.category}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                {skill.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSkill(skill);
                                setShowSkillForm(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSkill(skill.id)}
                              disabled={deleteSkillMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Skill Form Modal */}
      {showSkillForm && (
        <SkillForm
          skill={editingSkill}
          onClose={() => {
            setShowSkillForm(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}

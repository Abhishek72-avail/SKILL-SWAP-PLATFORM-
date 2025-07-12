import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Handshake } from "lucide-react";
import CallButton from "@/components/call-button";

interface UserCardProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    location?: string;
    availability?: string;
    rating?: number;
    reviewCount?: number;
    skills: Array<{
      id: number;
      name: string;
      type: string;
      category?: string;
      level?: string;
      priority?: string;
    }>;
  };
  onSendRequest: () => void;
}

export default function UserCard({ user, onSendRequest }: UserCardProps) {
  const skillsOffered = user.skills?.filter(skill => skill.type === "offered") || [];
  const skillsWanted = user.skills?.filter(skill => skill.type === "wanted") || [];

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={user.profileImageUrl} 
              className="object-cover"
            />
            <AvatarFallback className="text-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-odoo-dark">
              {user.firstName} {user.lastName}
            </h4>
            {user.location && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="mr-1 h-3 w-3" />
                {user.location}
              </p>
            )}
            {user.rating && user.reviewCount ? (
              <div className="flex items-center mt-1">
                <div className="flex mr-2">
                  {renderStarRating(user.rating)}
                </div>
                <span className="text-xs text-gray-500">
                  {user.rating.toFixed(1)} ({user.reviewCount} reviews)
                </span>
              </div>
            ) : (
              <div className="flex items-center mt-1">
                <div className="flex mr-2">
                  {renderStarRating(0)}
                </div>
                <span className="text-xs text-gray-500">No reviews yet</span>
              </div>
            )}
          </div>
        </div>
        
        {skillsOffered.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Offers:</p>
            <div className="flex flex-wrap gap-2">
              {skillsOffered.slice(0, 3).map((skill) => (
                <Badge key={skill.id} className="bg-green-100 text-green-800 text-xs">
                  {skill.name}
                </Badge>
              ))}
              {skillsOffered.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skillsOffered.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {skillsWanted.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Wants:</p>
            <div className="flex flex-wrap gap-2">
              {skillsWanted.slice(0, 3).map((skill) => (
                <Badge key={skill.id} className="bg-blue-100 text-blue-800 text-xs">
                  {skill.name}
                </Badge>
              ))}
              {skillsWanted.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skillsWanted.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {user.availability && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Available:</p>
            <p className="text-sm text-gray-600">{user.availability}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={onSendRequest}
            className="w-full bg-odoo-purple hover:bg-purple-700 text-sm font-medium"
          >
            <Handshake className="mr-2 h-4 w-4" />
            Send Swap Request
          </Button>
          
          <CallButton
            targetUserId={user.id}
            targetUserName={`${user.firstName} ${user.lastName}`}
            variant="outline"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

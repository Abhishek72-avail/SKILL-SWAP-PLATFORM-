import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import UserCard from "@/components/user-card";
import SwapRequestModal from "@/components/swap-request-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function BrowseSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users", { search: searchQuery }],
    retry: false,
  });

  const handleSendRequest = (user: any) => {
    setSelectedUser(user);
    setShowRequestModal(true);
  };

  const filteredUsers = users?.filter((user: any) => {
    if (locationFilter && !user.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter) {
      const hasCategory = user.skills?.some((skill: any) => 
        skill.category?.toLowerCase() === categoryFilter.toLowerCase() && skill.type === "offered"
      );
      if (!hasCategory) return false;
    }
    return true;
  }) || [];

  return (
    <div className="flex h-screen bg-odoo-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-odoo-dark">Browse Skills</h2>
              <p className="text-sm text-gray-600">Discover professionals and their expertise</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search skills or users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="san francisco">San Francisco, CA</SelectItem>
                <SelectItem value="new york">New York, NY</SelectItem>
                <SelectItem value="seattle">Seattle, WA</SelectItem>
                <SelectItem value="austin">Austin, TX</SelectItem>
                <SelectItem value="remote">Remote Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="languages">Languages</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="creative">Creative Arts</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            {(locationFilter || categoryFilter || searchQuery) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLocationFilter("");
                  setCategoryFilter("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border border-gray-200 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || locationFilter || categoryFilter 
                    ? "Try adjusting your search criteria or filters"
                    : "No users are currently available"}
                </p>
                {(searchQuery || locationFilter || categoryFilter) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setLocationFilter("");
                      setCategoryFilter("");
                      setSearchQuery("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Found <span className="font-semibold">{filteredUsers.length}</span> professionals
                  {searchQuery && (
                    <span> matching "<span className="font-semibold">{searchQuery}</span>"</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredUsers.map((user: any) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onSendRequest={() => handleSendRequest(user)}
                  />
                ))}
              </div>

              {filteredUsers.length >= 20 && (
                <div className="text-center">
                  <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
                    Load More Profiles
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Swap Request Modal */}
      {showRequestModal && selectedUser && (
        <SwapRequestModal
          targetUser={selectedUser}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

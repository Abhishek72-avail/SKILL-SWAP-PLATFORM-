import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, 
  Gauge, 
  User, 
  Search, 
  MessageSquare, 
  History, 
  Star,
  Users,
  BarChart3,
  Download,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    {
      icon: Gauge,
      label: "Dashboard",
      href: "/",
      active: location === "/",
    },
    {
      icon: User,
      label: "My Profile",
      href: "/profile",
      active: location === "/profile",
    },
    {
      icon: Search,
      label: "Browse Skills",
      href: "/browse",
      active: location === "/browse",
    },
    {
      icon: MessageSquare,
      label: "Swap Requests",
      href: "/requests",
      active: location === "/requests",
      badge: 3, // This could be dynamic based on pending requests
    },
    {
      icon: History,
      label: "Swap History",
      href: "/history",
      active: location === "/history",
    },
    {
      icon: Star,
      label: "Feedback",
      href: "/feedback",
      active: location === "/feedback",
    },
  ];

  const adminItems = [
    {
      icon: Users,
      label: "Manage Users",
      href: "/admin/users",
      active: location === "/admin/users",
    },
    {
      icon: BarChart3,
      label: "Swap Analytics",
      href: "/admin/analytics",
      active: location === "/admin/analytics",
    },
    {
      icon: Download,
      label: "Download Reports",
      href: "/admin/reports",
      active: location === "/admin/reports",
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-odoo-purple rounded-lg flex items-center justify-center">
            <Handshake className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-odoo-dark">SkillSwap</h1>
            <p className="text-sm text-gray-500">Professional Exchange</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? "text-white bg-odoo-purple"
                    : "text-gray-700 hover:bg-gray-100"
                }`}>
                  <IconComponent className="mr-3 h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-100 text-red-800 text-xs font-medium">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Section */}
        {user?.isAdmin && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Administration
            </p>
            <ul className="space-y-2">
              {adminItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.active
                        ? "text-white bg-odoo-purple"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                      <IconComponent className="mr-3 h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

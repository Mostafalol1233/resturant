import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Plus, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [language, setLanguage] = useState("en");
  const [notifications] = useState(3);
  const { user } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Logout Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleNewOrder = () => {
    console.log("New order clicked");
  };

  const handleNotifications = () => {
    console.log("Notifications clicked");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    console.log(`Language changed to: ${value}`);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Bella Vista Restaurant</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotifications}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="w-6 h-6" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Quick Actions */}
          <Button
            onClick={handleNewOrder}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex-col items-start">
                <div className="font-medium">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </div>
                <div className="text-xs text-gray-500">{user?.role || "admin"}</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

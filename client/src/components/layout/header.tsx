import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [language, setLanguage] = useState("en");
  const [notifications] = useState(3); // Mock notification count

  const handleNewOrder = () => {
    // This would trigger the new order modal
    console.log("New order clicked");
  };

  const handleNotifications = () => {
    // This would show notifications dropdown
    console.log("Notifications clicked");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // Implement language change logic here
    console.log(`Language changed to: ${value}`);
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
        </div>
      </div>
    </header>
  );
}

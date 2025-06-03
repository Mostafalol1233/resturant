import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function QuickActions() {
  const { toast } = useToast();

  const handleAddProduct = () => {
    // This would trigger the add product modal
    toast({
      title: "Add Product",
      description: "Opening product creation form...",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your sales and inventory report is being prepared...",
    });
  };

  const handleUpdateStock = () => {
    toast({
      title: "Update Stock",
      description: "Opening inventory management...",
    });
  };

  const handleManageStaff = () => {
    toast({
      title: "Staff Management",
      description: "Staff management features coming soon...",
    });
  };

  const actions = [
    {
      title: "Add Product",
      description: "Create new menu item",
      icon: Plus,
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500",
      onClick: handleAddProduct,
      href: "/products",
    },
    {
      title: "Generate Report",
      description: "Sales & inventory",
      icon: BarChart3,
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200",
      iconBg: "bg-green-500",
      onClick: handleGenerateReport,
      href: "/reports",
    },
    {
      title: "Update Stock",
      description: "Manage inventory",
      icon: RefreshCw,
      bgColor: "bg-orange-50 hover:bg-orange-100",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-500",
      onClick: handleUpdateStock,
      href: "/inventory",
    },
    {
      title: "Manage Staff",
      description: "User roles & access",
      icon: Users,
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-500",
      onClick: handleManageStaff,
      href: "/settings",
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <button
                className={`w-full flex items-center p-4 ${action.bgColor} rounded-lg border ${action.borderColor} transition-colors`}
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

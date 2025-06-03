import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, Users, TrendingUp } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Revenue",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      change: "+12% from yesterday",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "Orders Today", 
      value: stats?.totalOrders?.toString() || "0",
      change: "+8% from yesterday",
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount?.toString() || "0",
      change: "Needs attention",
      icon: AlertTriangle,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-orange-600",
    },
    {
      title: "Active Staff",
      value: "12",
      change: "Out of 15 total",
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-sm mt-1 ${card.changeColor}`}>
                  {card.title !== "Active Staff" && card.title !== "Low Stock Items" && (
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                  )}
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

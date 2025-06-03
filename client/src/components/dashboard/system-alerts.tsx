import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Link } from "wouter";

export default function SystemAlerts() {
  const { data: lowStockProducts } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Stock Alert",
      message: lowStockProducts && lowStockProducts.length > 0 
        ? `${lowStockProducts.slice(0, 3).map((p: any) => p.name).join(', ')}${lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more items` : ''} running low`
        : "No low stock items",
      show: lowStockProducts && lowStockProducts.length > 0,
      action: "Update Stock",
      href: "/inventory",
    },
    {
      id: 2,
      type: "success",
      title: "Backup Completed",
      message: "Daily backup completed successfully at 2:00 AM",
      show: true,
      timestamp: "Just now",
    },
    {
      id: 3,
      type: "info",
      title: "System Update",
      message: "RestaurantPOS v2.1.0 is running with latest features",
      show: true,
      timestamp: "5 min ago",
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertTriangle;
      case "success":
        return CheckCircle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          textTitle: "text-orange-800",
          textMessage: "text-orange-700",
          icon: "text-orange-500",
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          textTitle: "text-green-800",
          textMessage: "text-green-700",
          icon: "text-green-500",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          textTitle: "text-blue-800",
          textMessage: "text-blue-700",
          icon: "text-blue-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          textTitle: "text-gray-800",
          textMessage: "text-gray-700",
          icon: "text-gray-500",
        };
    }
  };

  const visibleAlerts = alerts.filter(alert => alert.show);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length > 0 ? (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              const colors = getAlertColors(alert.type);
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-start p-4 ${colors.bg} border ${colors.border} rounded-lg`}
                >
                  <Icon className={`w-5 h-5 ${colors.icon} mt-0.5 mr-3 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className={`font-medium ${colors.textTitle}`}>{alert.title}</p>
                    <p className={`text-sm ${colors.textMessage} mt-1`}>{alert.message}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.timestamp && (
                      <span className={`text-xs ${colors.textMessage} bg-white px-2 py-1 rounded-full`}>
                        {alert.timestamp}
                      </span>
                    )}
                    {alert.action && alert.href && (
                      <Link href={alert.href}>
                        <Button size="sm" variant="outline" className={`${colors.textTitle} hover:${colors.bg}`}>
                          {alert.action}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">All systems running smoothly</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

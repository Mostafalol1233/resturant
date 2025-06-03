import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Truck, Eye } from "lucide-react";
import { Link } from "wouter";

const statusIcons = {
  pending: Clock,
  preparing: Clock,
  ready: CheckCircle,
  served: CheckCircle,
  cancelled: Clock,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-orders"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
              return (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.status === 'ready' ? 'bg-green-100' :
                      order.status === 'preparing' ? 'bg-blue-100' :
                      order.status === 'pending' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {order.type === 'delivery' ? (
                        <Truck className={`w-5 h-5 ${
                          order.status === 'ready' ? 'text-green-600' :
                          order.status === 'preparing' ? 'text-blue-600' :
                          order.status === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                      ) : (
                        <span className={`text-sm font-medium ${
                          order.status === 'ready' ? 'text-green-600' :
                          order.status === 'preparing' ? 'text-blue-600' :
                          order.status === 'pending' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {order.tableNumber || order.orderNumber?.split('-')[1]?.slice(-2) || '#'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.orderItems?.slice(0, 2).map((item: any) => 
                          `${item.quantity}x ${item.product.name}`
                        ).join(', ')}
                        {order.orderItems?.length > 2 && '...'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total}</p>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent orders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

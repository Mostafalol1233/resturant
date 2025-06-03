import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import NewOrderModal from "@/components/orders/new-order-modal";

const statusIcons = {
  pending: Clock,
  preparing: Clock,
  ready: CheckCircle,
  served: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const ordersList = Array.isArray(orders) ? orders : [];

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
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
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Orders" />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {ordersList.length} Orders
              </Badge>
            </div>
            <Button
              onClick={() => setShowNewOrderModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {ordersList.map((order: any) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.type === "dine-in" && `Table ${order.tableNumber}`}
                            {order.type === "takeout" && "Takeout"}
                            {order.type === "delivery" && (
                              <span className="flex items-center">
                                <Truck className="w-4 h-4 mr-1" />
                                Delivery
                              </span>
                            )}
                          </p>
                        </div>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {(() => {
                            const Icon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
                            return <Icon className="w-3 h-3 mr-1" />;
                          })()}
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                          <div className="space-y-1">
                            {order.orderItems?.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.product.name}</span>
                                <span>${item.totalPrice}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${order.total}</span>
                          </div>
                        </div>

                        {order.customerName && (
                          <div className="text-sm text-gray-600">
                            Customer: {order.customerName}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>

                        <div className="pt-3">
                          <Select
                            value={order.status}
                            onValueChange={(status) => 
                              updateOrderStatusMutation.mutate({ id: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="served">Served</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!ordersLoading && ordersList.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first order</p>
              <Button
                onClick={() => setShowNewOrderModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          )}
        </main>
      </div>

      <NewOrderModal
        open={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
      />
    </div>
  );
}

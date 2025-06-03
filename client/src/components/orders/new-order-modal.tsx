import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X } from "lucide-react";

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
}

interface OrderItem {
  productId: number;
  product: any;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NewOrderModal({ open, onClose }: NewOrderModalProps) {
  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    enabled: open,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: open,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      handleClose();
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
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const addToOrder = (product: any) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice,
            }
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          product,
          quantity: 1,
          unitPrice: parseFloat(product.price),
          totalPrice: parseFloat(product.price),
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.productId !== productId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      ));
    }
  };

  const removeFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const total = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      order: {
        type: orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : undefined,
        customerName: orderType !== "dine-in" ? customerName : undefined,
        customerPhone: orderType === "delivery" ? customerPhone : undefined,
        subtotal: total,
        tax: total * 0.1, // 10% tax
        total: total * 1.1,
        paymentStatus: "paid",
      },
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const handleClose = () => {
    setOrderType("dine-in");
    setTableNumber("");
    setCustomerName("");
    setCustomerPhone("");
    setOrderItems([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            New Order
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Select Items</h4>
            
            {categories?.map((category: any) => {
              const categoryProducts = products?.filter((p: any) => p.categoryId === category.id);
              if (!categoryProducts || categoryProducts.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-6">
                  <h5 className="font-medium text-gray-700 mb-3">{category.name}</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryProducts.map((product: any) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToOrder(product)}
                      >
                        <CardContent className="p-3">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <span className="text-2xl">{product.name[0]}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">{product.name}</p>
                            <p className="text-sm text-blue-600 font-semibold">${product.price}</p>
                            {product.trackInventory && product.stockQuantity <= product.lowStockThreshold && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
            
            <div className="space-y-4 mb-6">
              {orderItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.product.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromOrder(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tax (10%)</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">Dine In</SelectItem>
                    <SelectItem value="takeout">Takeout</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === "dine-in" && (
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    placeholder="Enter table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              {orderType !== "dine-in" && (
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              )}

              {orderType === "delivery" && (
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    placeholder="Enter phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createOrderMutation.isPending || orderItems.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createOrderMutation.isPending ? "Creating..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

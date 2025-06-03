import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import StockAlerts from "@/components/inventory/stock-alerts";

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["/api/products/low-stock"],
    enabled: isAuthenticated,
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/inventory/transactions"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const trackableProducts = products?.filter((p: any) => p.trackInventory) || [];
  const totalItems = trackableProducts.reduce((sum: number, p: any) => sum + p.stockQuantity, 0);
  const averageStock = trackableProducts.length > 0 ? totalItems / trackableProducts.length : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Inventory" />
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Products
                  </CardTitle>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {trackableProducts.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">Tracked items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Stock
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {totalItems.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Units in stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Low Stock Items
                  </CardTitle>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {lowStockProducts?.length || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Stock
                  </CardTitle>
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {averageStock.toFixed(0)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Units per product</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Stock Alerts */}
            <StockAlerts />

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'sale' ? 'bg-red-100' :
                            transaction.type === 'purchase' ? 'bg-green-100' :
                            transaction.type === 'adjustment' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {transaction.type === 'sale' && <TrendingDown className="w-4 h-4 text-red-600" />}
                            {transaction.type === 'purchase' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {(transaction.type === 'adjustment' || transaction.type === 'waste') && 
                              <Package className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.reference || 'Manual adjustment'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Stock Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Product Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {trackableProducts.map((product: any) => {
                    const stockPercentage = (product.stockQuantity / (product.lowStockThreshold * 3)) * 100;
                    const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                    
                    return (
                      <div key={product.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {product.stockQuantity} / {product.lowStockThreshold * 3} units
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(stockPercentage, 100)} 
                          className={`h-2 ${isLowStock ? 'text-red-600' : ''}`}
                        />
                      </div>
                    );
                  })}
                  
                  {trackableProducts.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No products with inventory tracking enabled</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

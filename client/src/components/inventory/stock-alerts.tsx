import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function StockAlerts() {
  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Stock Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Stock Alerts</span>
          </CardTitle>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
              Manage Stock
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="space-y-4">
            {lowStockProducts.slice(0, 10).map((product: any) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.stockQuantity} units remaining
                    </p>
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Low Stock
                </Badge>
              </div>
            ))}
            
            {lowStockProducts.length > 10 && (
              <div className="text-center pt-2">
                <Link href="/inventory">
                  <Button variant="outline" size="sm">
                    View All ({lowStockProducts.length - 10} more)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
            <p className="text-gray-500 mb-4">No low stock items at the moment</p>
            <Link href="/products">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                View Products
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

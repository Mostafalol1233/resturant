import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Users, BarChart3, Shield, Zap, Globe } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const autoLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auto-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Auto-login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Auto-login Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleAutoLogin = () => {
    autoLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RestaurantPOS</h1>
                <p className="text-sm text-gray-500">Professional Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleLogin} className="flex items-center space-x-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-48"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-32"
                />
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loginMutation.isPending ? "..." : "Sign In"}
                </Button>
              </form>
              <div className="text-gray-300">|</div>
              <Button 
                onClick={handleAutoLogin}
                variant="outline"
                disabled={autoLoginMutation.isPending}
              >
                {autoLoginMutation.isPending ? "..." : "Demo"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Modern Restaurant & Retail Management
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your operations with our comprehensive POS system designed for restaurants and retail stores. 
            Manage orders, inventory, staff, and analytics all in one place.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Efficient order processing for dine-in, takeout, and delivery with real-time status tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Inventory Control</CardTitle>
              <CardDescription>
                Smart inventory management with low-stock alerts and automated reorder suggestions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Role-based access control with different permission levels for admins, managers, and staff
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Enterprise-grade security with automated backups and data protection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Multi-language</CardTitle>
              <CardDescription>
                Support for English and Arabic with right-to-left text rendering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Comprehensive reports and insights to help you make data-driven decisions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants and retail stores that trust our platform to manage their operations efficiently.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Start Your Journey
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold">RestaurantPOS</h4>
            </div>
            <p className="text-gray-400">
              © 2024 RestaurantPOS. Professional restaurant and retail management system.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

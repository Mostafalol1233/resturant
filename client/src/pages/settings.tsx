import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings, Users, Shield, Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const restaurantForm = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      currency: "USD",
      timezone: "UTC",
    },
  });

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

  const updateRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/restaurant", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Restaurant settings updated successfully",
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
        description: "Failed to update restaurant settings",
        variant: "destructive",
      });
    },
  });

  const handleRestaurantSubmit = (data: any) => {
    updateRestaurantMutation.mutate(data);
  };

  const [backups, setBackups] = useState<string[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // جلب قائمة الباك أب
  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup/list', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('خطأ في جلب قائمة الباك أب:', error);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        alert('تم إنشاء الباك أب بنجاح!');
        fetchBackups(); // إعادة تحميل القائمة
      } else {
        alert('خطأ في إنشاء الباك أب: ' + data.message);
      }
    } catch (error) {
      alert('خطأ في إنشاء الباك أب');
      console.error(error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async (fileName: string) => {
    if (!confirm(`هل أنت متأكد من استعادة الباك أب: ${fileName}؟\nسيتم استبدال البيانات الحالية.`)) {
      return;
    }

    setIsRestoringBackup(true);
    try {
      const response = await fetch(`/api/backup/restore/${fileName}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        alert('تم استعادة الباك أب بنجاح!');
        window.location.reload(); // إعادة تحميل الصفحة
      } else {
        alert('خطأ في استعادة الباك أب: ' + data.message);
      }
    } catch (error) {
      alert('خطأ في استعادة الباك أب');
      console.error(error);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await fetch(`/api/backup/download/${fileName}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('خطأ في تحميل الباك أب');
      }
    } catch (error) {
      alert('خطأ في تحميل الباك أب');
      console.error(error);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الباك أب: ${fileName}؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/backup/delete/${fileName}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        alert('تم حذف الباك أب بنجاح!');
        fetchBackups(); // إعادة تحميل القائمة
      } else {
        alert('خطأ في حذف الباك أب: ' + data.message);
      }
    } catch (error) {
      alert('خطأ في حذف الباك أب');
      console.error(error);
    }
  };

  const handleImport = () => {
    // Import functionality would be implemented here
    console.log("Import initiated");
  };

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
        <Header title="Settings" />
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Backup</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Restaurant Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter restaurant name"
                          {...restaurantForm.register("name")}
                        />
                        {restaurantForm.formState.errors.name && (
                          <p className="text-sm text-red-600">
                            {restaurantForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          {...restaurantForm.register("phone")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          {...restaurantForm.register("email")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={restaurantForm.watch("currency")}
                          onValueChange={(value) => restaurantForm.setValue("currency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="AED">AED (د.إ)</SelectItem>
                            <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter full address"
                        {...restaurantForm.register("address")}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateRestaurantMutation.isPending}
                    >
                      {updateRestaurantMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Notifications</Label>
                      <p className="text-sm text-gray-500">Get notified when products are running low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Reports</Label>
                      <p className="text-sm text-gray-500">Receive daily sales reports via email</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Notifications</Label>
                      <p className="text-sm text-gray-500">Play sounds for new orders and alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user?.firstName?.[0] || user?.email?.[0] || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user?.email || "Current User"}
                          </p>
                          <p className="text-sm text-gray-500">{user?.role || "admin"}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Current User</Badge>
                    </div>

                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">User management features coming soon</p>
                      <Button variant="outline" disabled>
                        <Users className="w-4 h-4 mr-2" />
                        Invite User
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Authentication Enabled</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Your account is secured with local authentication
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                      </div>
                      <Select defaultValue="24h">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="8h">8 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Backup & Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Backup Your Data</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Create a complete backup of all your restaurant data including orders, products, and settings.
                      </p>
                      <Button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700" disabled={isCreatingBackup}>
                        <Download className="w-4 h-4 mr-2" />
                        {isCreatingBackup ? 'Creating Backup...' : 'Create Backup'}
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Restore Data</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Restore your data from a previous backup.
                      </p>
                      {backups.length > 0 ? (
                        <div className="space-y-2">
                          {backups.map((backup, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{backup}</span>
                              <div>
                                <Button
                                  onClick={() => handleRestore(backup)}
                                  variant="secondary"
                                  size="sm"
                                  disabled={isRestoringBackup}
                                >
                                  {isRestoringBackup ? 'Restoring...' : 'Restore'}
                                </Button>
                                <Button
                                  onClick={() => handleDownload(backup)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Download
                                </Button>
                                <Button
                                  onClick={() => handleDelete(backup)}
                                  variant="destructive"
                                  size="sm"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No backups available.</p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Import data from a previous backup or migrate from another system.
                      </p>
                      <Button onClick={handleImport} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Automatic Backups</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Enable automatic daily backups to ensure your data is always protected.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Daily Automatic Backup</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
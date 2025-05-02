"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { userDetails, loading, error, fetchUserDetails } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchUserDetails();
    }
  }, [isAuthenticated, router, fetchUserDetails]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading user details...</p>
              ) : error ? (
                <p className="text-red-500">Error loading user details: {error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                      <p>{user?.name || userDetails?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p>{user?.email || userDetails?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p>{userDetails?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                      <p>{userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'Not available'}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => router.push('/profile/edit')}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="orders" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/order-history')}>View All Orders</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="addresses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/profile/addresses')}>Manage Addresses</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={() => router.push('/profile/change-password')} className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/profile/notifications')} className="w-full justify-start">
                    Notification Preferences
                  </Button>
                  <Button variant="destructive" onClick={handleLogout} className="w-full justify-start">
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}


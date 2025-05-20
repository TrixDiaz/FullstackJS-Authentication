"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/auth-service";

export default function Profile() {
  const [ user, setUser ] = useState<User | null>(null);
  const [ isLoading, setIsLoading ] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          console.log("User data:", userData); // Log to see all available fields
        } else {
          // Show toast and redirect to login if no authenticated user
          toast({
            title: "Authentication required",
            description: "Please login first to access your profile",
            variant: "destructive",
          });
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        toast({
          title: "Authentication required",
          description: "Please login first to access your profile",
          variant: "destructive",
        });
        router.push('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [ router, toast ]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  // If no user and not loading, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userInfoItems = [
    { label: "Email", value: user.email },
    { label: "Job Title", value: user.jobTitle || "Not specified" },
    { label: "Company", value: user.company || "Not specified" },
    { label: "Phone", value: user.phoneNumber || "Not specified" },
    { label: "Role", value: user.role || "user" },
    { label: "Verification Status", value: user.isVerified ? "Verified" : "Not Verified" },
    { label: "Created At", value: user.createdAt ? formatDate(user.createdAt) : "Not available" },
    { label: "Updated At", value: user.updatedAt ? formatDate(user.updatedAt) : "Not available" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              View and manage your profile information
            </p>
          </div>
          <Button asChild>
            <Link href="/profile/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your personal profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar || user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-4xl">{user.firstName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
                      {user.role && (
                        <span className="text-sm text-muted-foreground">{user.role}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
                      {user.bio && (
                        <p className="text-muted-foreground mt-2">{user.bio}</p>
                      )}
                    </div>
                    <Separator />
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userInfoItems.map((item) => (
                        <div key={item.label} className="space-y-1">
                          <dt className="text-sm font-medium text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="text-sm font-semibold">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated 30 days ago
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/profile/settings">Change password</Link>
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Enhance your account security
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/profile/settings">Setup 2FA</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
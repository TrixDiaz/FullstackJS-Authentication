"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, User, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-service";
import type { User as UserType } from "@/lib/auth-service";
import { signOut } from "@/lib/auth-service";

export default function Home() {
  const router = useRouter();
  const [ user, setUser ] = useState<UserType | null>(null);
  const [ isLoading, setIsLoading ] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const features = [
    {
      icon: <User className="h-10 w-10 text-primary" />,
      title: "User Authentication",
      description: "Secure sign-in and sign-up with email verification"
    },
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: "Password Management",
      description: "Easy password reset and recovery options"
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Profile Security",
      description: "Manage and update your profile information securely"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold animate-fade-in">
            Enterprise Auth
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <section className="space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/profile")}
                    >
                      Profile
                    </Button>
                    <Button
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </section>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/auth/signin")}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/signup")}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Enterprise-Grade Authentication
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Secure, scalable, and seamless authentication system with comprehensive profile management
              </p>
              <div className="mt-10">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={() => router.push("/auth/signup")}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border rounded-lg p-6 text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="mx-auto mb-4 bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Enterprise Auth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
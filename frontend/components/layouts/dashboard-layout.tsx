"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, User, LogOut, Menu, X, ArrowLeft, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { signOut, getCurrentUser } from "@/lib/auth-service";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import type { User as UserType } from "@/lib/auth-service";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [ isMounted, setIsMounted ] = useState(false);
  const [ user, setUser ] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/auth/signin');
      } else {
        setUser(userData);
      }
    };

    fetchUser();
    setIsMounted(true);
  }, [ router ]);

  const navItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/profile/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  if (!isMounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden border-b sticky top-0 z-30 bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Fingerprint className="h-6 w-6" />
                    <span className="text-lg font-semibold">Enterprise Auth</span>
                  </div>
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        asChild
                        className="w-full justify-start"
                      >
                        <Link href={item.href}>
                          {item.icon}
                          {item.title}
                        </Link>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-lg font-semibold">Enterprise Auth</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/10">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Fingerprint className="h-6 w-6" />
            <span className="text-lg font-semibold">Enterprise Auth</span>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                asChild
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="hidden lg:flex h-16 items-center border-b px-6 justify-end gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
              <Link href="/profile">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
          <div
            key={pathname}
            className="container py-6 px-4 md:py-8 md:px-6 animate-fade-in-up"
          >
            {pathname !== "/profile" && pathname !== "/dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
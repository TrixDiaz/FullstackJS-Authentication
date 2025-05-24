"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Fingerprint } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <div className="hidden w-1/2 flex-col bg-muted p-10 text-white dark:border-r lg:flex animate-fade-in">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-8 w-8" />
            <span className="text-xl font-bold">Enterprise Auth</span>
          </div>
          <div className="mt-auto">
            <div className="animate-fade-in-up">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  "Security is not just a feature, it's a promise. Our authentication system ensures your data remains protected while providing a seamless user experience."
                </p>
                <footer className="text-sm">Enterprise Security Team</footer>
              </blockquote>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:w-1/2 animate-fade-in-up">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            <p className="px-8 text-center text-sm text-muted-foreground">
              By using our service, you agree to our{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
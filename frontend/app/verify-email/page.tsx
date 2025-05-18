"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isVerified, setIsVerified ] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");

            if (!token) {
                toast({
                    variant: "destructive",
                    title: "Verification failed",
                    description: "Invalid verification link. Please request a new one.",
                });
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`, {
                    method: "GET",
                });

                const data = await response.json();

                if (response.ok) {
                    setIsVerified(true);
                    toast({
                        title: "Email verified successfully!",
                        description: data.message || "You can now sign in to your account.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Verification failed",
                        description: data.message || "Invalid or expired verification token.",
                    });
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Verification failed",
                    description: "An error occurred while verifying your email.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        verifyEmail();
    }, [ searchParams, toast ]);

    return (
        <AuthLayout
            title="Email Verification"
            subtitle="Verifying your email address..."
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center space-y-4"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Please wait while we verify your email...
                        </p>
                    </div>
                ) : isVerified ? (
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            Your email has been verified successfully! You can now log in.
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => router.push("/auth/signin")}
                        >
                            Sign In
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            The verification link is invalid or has expired.
                        </p>
                        <div className="space-y-2 w-full">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/auth/signup")}
                            >
                                Back to Sign Up
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/resend-verification")}
                            >
                                Resend Verification Email
                            </Button>
                            <Button
                                variant="link"
                                className="w-full"
                                onClick={() => router.push("/")}
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </AuthLayout>
    );
} 
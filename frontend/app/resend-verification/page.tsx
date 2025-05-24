"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resendVerification } from "@/lib/auth-service";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResendVerification() {
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ isSuccess, setIsSuccess ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    // Check if email was provided in URL parameters
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            form.setValue('email', emailParam);

            // If email was provided from sign-in, show a helpful message
            toast({
                title: "Email verification required",
                description: "Please verify your email before signing in",
            });
        }
    }, [ searchParams, form, toast ]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            const result = await resendVerification(values.email);

            if (result.success) {
                if (result.isVerified) {
                    toast({
                        title: "Already verified",
                        description: "This email is already verified. You can sign in now.",
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/auth/signin")}
                            >
                                Sign In
                            </Button>
                        ),
                    });
                    // Redirect to sign in after a short delay
                    setTimeout(() => {
                        router.push("/auth/signin");
                    }, 2000);
                } else {
                    setIsSuccess(true);
                    toast({
                        title: "Verification email sent!",
                        description: "Please check your inbox for the verification link.",
                    });
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to send verification email",
                    description: result.message || "An error occurred. Please try again.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: "An error occurred while sending the verification email.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Resend Verification Email"
            subtitle="Enter your email to receive a new verification link"
        >
            <div className="flex flex-col space-y-4 w-full animate-fade-in-up">
                {isSuccess ? (
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            A new verification link has been sent to your email address.
                            Please check your inbox and spam folder.
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => router.push("/auth/signin")}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com"
                                                type="email"
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Verification Link"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="w-full"
                                onClick={() => router.push("/auth/signin")}
                            >
                                Back to Sign In
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </AuthLayout>
    );
}
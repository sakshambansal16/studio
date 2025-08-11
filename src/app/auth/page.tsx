
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EmailLoginForm from '@/components/auth/EmailLoginForm';
import EmailSignUpForm from '@/components/auth/EmailSignUpForm';
import PhoneSignUpForm from '@/components/auth/PhoneSignUpForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Phone, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="absolute top-4 left-4">
                <Link href="/" passHref>
                    <h1 className="text-2xl font-bold text-primary">Tic Tac Toe</h1>
                </Link>
            </div>
            <Tabs defaultValue="login" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Back!</CardTitle>
                            <CardDescription>Sign in to continue your game.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EmailLoginForm />
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>
                            <GoogleSignInButton />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create an Account</CardTitle>
                            <CardDescription>Choose your preferred sign-up method.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="email" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Email</TabsTrigger>
                                    <TabsTrigger value="phone"><Phone className="mr-2 h-4 w-4" />Phone</TabsTrigger>
                                </TabsList>
                                <TabsContent value="email" className="pt-4 space-y-4">
                                     <EmailSignUpForm />
                                     <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Or</span>
                                        </div>
                                    </div>
                                    <GoogleSignInButton />
                                </TabsContent>
                                <TabsContent value="phone" className="pt-4">
                                    <PhoneSignUpForm />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}

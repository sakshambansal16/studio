
'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "Please enter a valid phone number with country code (e.g., +11234567890)." }),
});

const codeSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits." }),
});

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function PhoneSignUpForm() {
  const [loading, setLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (isCodeSent) return;

    const setupRecaptcha = () => {
        if (window.recaptchaVerifier || !recaptchaContainerRef.current) return;
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved.
                },
                'expired-callback': () => {
                    toast({
                        variant: "destructive",
                        title: "reCAPTCHA Expired",
                        description: "Please try sending the code again.",
                    });
                    setLoading(false);
                }
            });
        } catch(error: any) {
            console.error("reCAPTCHA setup error", error);
            toast({
                variant: "destructive",
                title: "reCAPTCHA Error",
                description: `Could not initialize reCAPTCHA. Please check your Firebase project's authorized domains. The error was: ${error.code}`,
            });
        }
    };
    
    setupRecaptcha();

    return () => {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        }
    }
  }, [isCodeSent, toast]);


  async function onSendCode(values: z.infer<typeof phoneSchema>) {
    setLoading(true);
    
    if (!window.recaptchaVerifier) {
      toast({
        variant: "destructive",
        title: "reCAPTCHA Error",
        description: "Verifier not initialized. Please refresh and try again.",
      });
      setLoading(false);
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, values.phone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setIsCodeSent(true);
      toast({
        title: "Verification Code Sent",
        description: `A code has been sent to ${values.phone}.`,
      });
    } catch (error: any) {
      console.error("Phone auth error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Code",
        description: `An error occurred: ${error.code}. Please ensure your Firebase project is configured correctly for phone auth and this domain is authorized.`,
      });
      // Don't reset reCAPTCHA here, let the useEffect handle it on back navigation.
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(values: z.infer<typeof codeSchema>) {
    const confirmationResult = window.confirmationResult;
    if (!confirmationResult) {
        toast({ variant: "destructive", title: "Verification Error", description: "Please request a new code." });
        return;
    };

    setLoading(true);
    try {
      await confirmationResult.confirm(values.code);
      toast({ title: "Success!", description: "You have been signed in." });
      // The redirect will be handled by the AuthProvider after successful login
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The code you entered is invalid or has expired. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }
  
  const handleBackToPhone = () => {
    setIsCodeSent(false);
    // The useEffect will now re-run and set up reCAPTCHA again.
  }

  return (
    <>
      <div ref={recaptchaContainerRef}></div>
      {!isCodeSent ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...codeForm}>
          <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Sign In
            </Button>
            <Button variant="link" size="sm" className="w-full" onClick={handleBackToPhone}>
                Use a different phone number
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}

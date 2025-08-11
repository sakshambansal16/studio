
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

// Add this to your global types or in a separate .d.ts file
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
    if (!recaptchaContainerRef.current || window.recaptchaVerifier) return;
    
    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, you can proceed with sign-in.
        },
        'expired-callback': () => {
          toast({
              variant: "destructive",
              title: "reCAPTCHA Expired",
              description: "Please try sending the code again.",
          });
          window.recaptchaVerifier?.clear();
          setLoading(false);
        }
      });
      window.recaptchaVerifier = verifier;
    } catch (error) {
        console.error("Error creating RecaptchaVerifier", error);
        toast({
            variant: "destructive",
            title: "reCAPTCHA Error",
            description: "Could not initialize reCAPTCHA. Please refresh the page and try again.",
        });
    }
  }, [toast]);


  async function onSendCode(values: z.infer<typeof phoneSchema>) {
    setLoading(true);
    
    try {
      const verifier = window.recaptchaVerifier;
      if (verifier) {
        const confirmationResult = await signInWithPhoneNumber(auth, values.phone, verifier);
        window.confirmationResult = confirmationResult;
        setIsCodeSent(true);
        toast({
          title: "Verification Code Sent",
          description: `A code has been sent to ${values.phone}.`,
        });
      } else {
        throw new Error("reCAPTCHA verifier not initialized. Please try again.");
      }
    } catch (error: any) {
      console.error("Phone auth error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Code",
        description: error.message,
      });
      window.recaptchaVerifier?.clear();
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
            <Button variant="link" size="sm" className="w-full" onClick={() => { setIsCodeSent(false); window.recaptchaVerifier?.clear() }}>
                Use a different phone number
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
